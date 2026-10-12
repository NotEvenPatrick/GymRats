package de.patrickoeder.gymrats.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import de.patrickoeder.gymrats.exercise.Exercise;
import de.patrickoeder.gymrats.exercise.ExerciseRepository;
import de.patrickoeder.gymrats.exercise.MuscleGroup;

@Configuration 
public class ExerciseDataInitializer {

    private record ExerciseSeed(String name, MuscleGroup muscleGroup, String description) {}

    private static final List<ExerciseSeed> DEFAULT_EXERCISES = List.of(
        new ExerciseSeed("Squat", MuscleGroup.LEGS, "Übung für die Beine, insbesondere die Oberschenkel und das Gesäß."),
        new ExerciseSeed("Deadlift", MuscleGroup.BACK, "Übung für den Rücken, insbesondere den unteren Rücken und die hintere Oberschenkelmuskulatur."),
        new ExerciseSeed("Leg Extension", MuscleGroup.LEGS, "Übung für die Oberschenkelmuskulatur, insbesondere den Quadrizeps."),
        new ExerciseSeed("Leg Curl", MuscleGroup.LEGS, "Übung für die Oberschenkelmuskulatur, insbesondere den hinteren Oberschenkel."),
        new ExerciseSeed("Calf Raise", MuscleGroup.LEGS, "Übung für die Wadenmuskulatur, insbesondere den Wadenmuskel."),
        new ExerciseSeed("Bench Press", MuscleGroup.CHEST, "Übung für die Brustmuskulatur, insbesondere den großen Brustmuskel."),
        new ExerciseSeed("Incline Bench Press", MuscleGroup.CHEST, "Übung für die obere Brustmuskulatur, insbesondere den oberen Teil des großen Brustmuskels."),
        new ExerciseSeed("Dips", MuscleGroup.CHEST, "Übung für die Brustmuskulatur, insbesondere den großen Brustmuskel."),
        new ExerciseSeed("Chest Fly", MuscleGroup.CHEST, "Übung für die Brustmuskulatur, insbesondere den großen Brustmuskel."),
        new ExerciseSeed("Lat Pulldown", MuscleGroup.BACK, "Übung für den Rücken, insbesondere den Latissimus."),
        new ExerciseSeed("T-Bar Row", MuscleGroup.BACK, "Übung für den Rücken, insbesondere den Trapez und die hintere Schultermuskulatur."),
        new ExerciseSeed("Shoulder Press", MuscleGroup.SHOULDERS, "Übung für die Schultermuskulatur, insbesondere den Deltamuskel."),
        new ExerciseSeed("Lateral Raise", MuscleGroup.SHOULDERS, "Übung für die seitliche Schultermuskulatur, insbesondere den seitlichen Teil des Deltamuskels."),
        new ExerciseSeed("Bicep Curl", MuscleGroup.BICEPS, "Übung für die Armmuskulatur, insbesondere den Bizeps."),
        new ExerciseSeed("Tricep Extension", MuscleGroup.TRICEPS, "Übung für die Armmuskulatur, insbesondere den Trizeps.")
    );

    @Bean
    CommandLineRunner initExercises(ExerciseRepository exerciseRepository) {
        return args -> {
            for (ExerciseSeed seed : DEFAULT_EXERCISES) {
                if (!exerciseRepository.existsByName(seed.name())) {
                    Exercise exercise = new Exercise();
                    exercise.setName(seed.name());
                    exercise.setMuscleGroup(seed.muscleGroup());
                    exercise.setDescription(seed.description());
                    exerciseRepository.save(exercise);
                }
            }
        };
    }
}
           
