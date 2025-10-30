import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Arial', sans-serif;
`;

const Header = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-width: 500px;
  width: 100%;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4ecdc4;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4ecdc4;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #4ecdc4;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: #4ecdc4;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #45b7aa;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const WorkoutPlanContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-width: 600px;
  width: 100%;
  margin-bottom: 20px;
`;

const ExerciseCard = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin: 15px 0;
  border-left: 4px solid #4ecdc4;
`;

const ExerciseTitle = styled.h3`
  color: #333;
  margin: 0 0 10px 0;
`;

const ExerciseDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin: 10px 0;
`;

const DetailItem = styled.div`
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
`;

const Instructions = styled.p`
  background: #e3f2fd;
  padding: 12px;
  border-radius: 6px;
  margin: 10px 0;
  font-style: italic;
  color: #1976d2;
`;

const MusclesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
`;

const MuscleTag = styled.span`
  background: #ff6b6b;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  border-left: 4px solid #f44336;
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
