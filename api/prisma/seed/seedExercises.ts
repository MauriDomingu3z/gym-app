import fs from "node:fs";
import path from "node:path";
import manifest from "@bryllim/workout-guide/manifest.json";
import { prisma } from "../../src/shared/db/prismaClient";
import { exerciseInstructionsEs } from "./exerciseInstructionsEs";
import { exerciseNameTranslations } from "./exerciseNameTranslations";

interface ManifestFrame {
  path: string;
}

interface ManifestExercise {
  slug: string;
  name: string;
  exerciseType: string;
  equipment: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  isStretch: boolean;
  frames: ManifestFrame[];
}

const exercises = manifest as ManifestExercise[];

async function main() {
  const packageRoot = path.dirname(require.resolve("@bryllim/workout-guide/package.json"));
  const publicDir = path.resolve(process.cwd(), "public", "exercises");

  for (const exercise of exercises) {
    const targetDir = path.join(publicDir, exercise.slug);
    fs.mkdirSync(targetDir, { recursive: true });

    const framePaths = exercise.frames.map((frame) => {
      const fileName = path.basename(frame.path);
      fs.copyFileSync(path.join(packageRoot, frame.path), path.join(targetDir, fileName));
      return `/static/exercises/${exercise.slug}/${fileName}`;
    });

    const nameEs = exerciseNameTranslations[exercise.slug] ?? exercise.name;
    const instructionsEs = exerciseInstructionsEs[exercise.slug] ?? [];

    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      create: {
        slug: exercise.slug,
        name: exercise.name,
        nameEs,
        instructionsEs,
        exerciseType: exercise.exerciseType,
        equipment: exercise.equipment,
        primaryMuscle: exercise.primaryMuscle,
        secondaryMuscles: exercise.secondaryMuscles,
        isStretch: exercise.isStretch,
        frames: framePaths,
      },
      update: {
        name: exercise.name,
        nameEs,
        instructionsEs,
        exerciseType: exercise.exerciseType,
        equipment: exercise.equipment,
        primaryMuscle: exercise.primaryMuscle,
        secondaryMuscles: exercise.secondaryMuscles,
        isStretch: exercise.isStretch,
        frames: framePaths,
      },
    });
  }

  console.log(`Seed completo: ${exercises.length} ejercicios.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
