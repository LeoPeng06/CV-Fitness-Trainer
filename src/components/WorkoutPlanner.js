import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(16px, 2vw, 32px);
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
  color: white;
`;

const Header = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 12px;
  font-size: clamp(2rem, 4vw, 3rem);
  text-shadow: 0 10px 25px rgba(0,0,0,0.4);
`;

const Subtitle = styled.p`
  color: rgba(255,255,255,0.9);
  text-align: center;
  margin-bottom: clamp(20px, 3vw, 36px);
  font-size: clamp(1rem, 1.7vw, 1.2rem);
  max-width: 640px;
  line-height: 1.6;
`;

const FormContainer = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 24px;
  padding: clamp(24px, 3vw, 36px);
  box-shadow: 0 30px 65px rgba(15,15,45,0.35);
  width: min(90vw, 640px);
  margin-bottom: clamp(20px, 3vw, 32px);
  border: 1px solid rgba(0,0,0,0.05);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #111827;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
  background: rgba(17,24,39,0.03);

  &:focus {
    outline: none;
    border-color: #4ecdc4;
    box-shadow: 0 0 0 3px rgba(78,205,196,0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
  background: rgba(17,24,39,0.03);

  &:focus {
    outline: none;
    border-color: #4ecdc4;
    box-shadow: 0 0 0 3px rgba(78,205,196,0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  background: rgba(17,24,39,0.03);

  &:focus {
    outline: none;
    border-color: #4ecdc4;
    box-shadow: 0 0 0 3px rgba(78,205,196,0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 60px;
  background: linear-gradient(135deg, #4ecdc4, #13a8a1);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 15px 30px rgba(78,205,196,0.35);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 35px rgba(78,205,196,0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const WorkoutPlanContainer = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 24px;
  padding: clamp(24px, 3vw, 36px);
  box-shadow: 0 30px 65px rgba(15,15,45,0.35);
  width: min(95vw, 720px);
  margin-bottom: clamp(20px, 3vw, 32px);
  border: 1px solid rgba(0,0,0,0.05);
`;

const ExerciseCard = styled.div`
  background: rgba(78,205,196,0.08);
  border-radius: 16px;
  padding: 20px;
  margin: 15px 0;
  border: 1px solid rgba(78,205,196,0.2);
  box-shadow: 0 12px 30px rgba(78,205,196,0.2);
`;

const ExerciseTitle = styled.h3`
  color: #0d1b2a;
  margin: 0 0 12px 0;
`;

const ExerciseDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 14px;
  margin: 10px 0;
`;

const DetailItem = styled.div`
  background: white;
  padding: 10px 12px;
  border-radius: 10px;
  text-align: center;
  font-size: 0.95rem;
  border: 1px solid rgba(0,0,0,0.05);
`;

const Instructions = styled.p`
  background: rgba(25, 118, 210, 0.12);
  padding: 14px;
  border-radius: 12px;
  margin: 12px 0;
  font-style: italic;
  color: #0d3c61;
  border: 1px solid rgba(25,118,210,0.15);
`;

const MusclesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const MuscleTag = styled.span`
  background: #ff6b6b;
  color: white;
  padding: 6px 10px;
  border-radius: 14px;
  font-size: 0.85rem;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.12);
  color: #b71c1c;
  padding: 15px;
  border-radius: 10px;
  margin: 20px 0;
  border: 1px solid rgba(244, 67, 54, 0.25);
`;

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const WorkoutPlanner = () => {
  const [userProfile, setUserProfile] = useState({
    age: '',
    fitness_level: 'beginner',
    goals: [],
    available_equipment: ['bodyweight'],
    workout_duration: 30
  });
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const equipmentOptions = [
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbells', label: 'Dumbbells' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'resistance_bands', label: 'Resistance Bands' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'pull_up_bar', label: 'Pull-up Bar' }
  ];

  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'strength', label: 'Strength' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'general_fitness', label: 'General Fitness' }
  ];

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGoalChange = (goal) => {
    setUserProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleEquipmentChange = (equipment) => {
    setUserProfile(prev => ({
      ...prev,
      available_equipment: prev.available_equipment.includes(equipment)
        ? prev.available_equipment.filter(e => e !== equipment)
        : [...prev.available_equipment, equipment]
    }));
  };

  const generateWorkoutPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/workout-plan`, {
        user_profile: userProfile,
        goals: userProfile.goals,
        available_equipment: userProfile.available_equipment,
        workout_duration: userProfile.workout_duration
      });

      setWorkoutPlan(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while generating workout plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>AI Workout Planner</Header>
      <Subtitle>Share your goals, time, and gear—we’ll craft the perfect session.</Subtitle>
      
      <FormContainer>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>
          Tell us about yourself
        </h2>
        
        <FormGroup>
          <Label>Age</Label>
          <Input
            type="number"
            value={userProfile.age}
            onChange={(e) => handleInputChange('age', e.target.value)}
            placeholder="Enter your age"
          />
        </FormGroup>

        <FormGroup>
          <Label>Fitness Level</Label>
          <Select
            value={userProfile.fitness_level}
            onChange={(e) => handleInputChange('fitness_level', e.target.value)}
          >
            {fitnessLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Goals (select multiple)</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {goalOptions.map(goal => (
              <label key={goal.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={userProfile.goals.includes(goal.value)}
                  onChange={() => handleGoalChange(goal.value)}
                  style={{ marginRight: '8px' }}
                />
                {goal.label}
              </label>
            ))}
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Available Equipment (select multiple)</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {equipmentOptions.map(equipment => (
              <label key={equipment.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={userProfile.available_equipment.includes(equipment.value)}
                  onChange={() => handleEquipmentChange(equipment.value)}
                  style={{ marginRight: '8px' }}
                />
                {equipment.label}
              </label>
            ))}
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Workout Duration (minutes)</Label>
          <Input
            type="number"
            value={userProfile.workout_duration}
            onChange={(e) => handleInputChange('workout_duration', parseInt(e.target.value))}
            min="10"
            max="120"
          />
        </FormGroup>

        <Button onClick={generateWorkoutPlan} disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : null}
          {isLoading ? 'Generating Plan...' : 'Generate Workout Plan'}
        </Button>
      </FormContainer>

      {error && (
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      )}

      {workoutPlan && (
        <WorkoutPlanContainer>
          <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>
            Your Personalized Workout Plan
          </h2>
          
          <div style={{ textAlign: 'center', marginBottom: '25px', color: '#666' }}>
            <p><strong>Total Exercises:</strong> {workoutPlan.total_exercises}</p>
            <p><strong>Estimated Duration:</strong> {workoutPlan.estimated_duration} minutes</p>
          </div>

          {workoutPlan.workout_plans.map((exercise, index) => (
            <ExerciseCard key={index}>
              <ExerciseTitle>{exercise.exercise_name}</ExerciseTitle>
              
              <ExerciseDetails>
                <DetailItem>
                  <strong>Sets:</strong> {exercise.sets}
                </DetailItem>
                <DetailItem>
                  <strong>Reps:</strong> {exercise.reps}
                </DetailItem>
                {exercise.duration && (
                  <DetailItem>
                    <strong>Duration:</strong> {exercise.duration}s
                  </DetailItem>
                )}
                <DetailItem>
                  <strong>Difficulty:</strong> {exercise.difficulty}
                </DetailItem>
              </ExerciseDetails>

              <Instructions>
                <strong>Instructions:</strong> {exercise.instructions}
              </Instructions>

              <div>
                <strong>Target Muscles:</strong>
                <MusclesList>
                  {exercise.target_muscles.map((muscle, muscleIndex) => (
                    <MuscleTag key={muscleIndex}>{muscle}</MuscleTag>
                  ))}
                </MusclesList>
              </div>
            </ExerciseCard>
          ))}
        </WorkoutPlanContainer>
      )}
    </Container>
  );
};

export default WorkoutPlanner;
