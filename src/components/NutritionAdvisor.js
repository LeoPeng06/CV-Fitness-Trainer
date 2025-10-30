import React, { useState } from 'react';
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

const NutritionAdviceContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-width: 600px;
  width: 100%;
  margin-bottom: 20px;
`;

const MealCard = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin: 15px 0;
  border-left: 4px solid #4ecdc4;
`;

const MealTitle = styled.h3`
  color: #333;
  margin: 0 0 15px 0;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 15px 0;
`;

const NutritionItem = styled.div`
  background: white;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const NutritionLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

const NutritionValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const FoodList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
`;

const FoodItem = styled.span`
  background: #ff6b6b;
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 14px;
`;

const BenefitsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
`;

const BenefitItem = styled.span`
  background: #4CAF50;
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 14px;
`;

const TimingInfo = styled.div`
  background: #e3f2fd;
  padding: 12px;
  border-radius: 8px;
  margin: 10px 0;
  color: #1976d2;
  font-style: italic;
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

const NutritionAdvisor = () => {
  const [userProfile, setUserProfile] = useState({
    age: '',
    fitness_level: 'beginner',
    goals: [],
    dietary_restrictions: []
  });
  const [mealType, setMealType] = useState('general');
  const [nutritionAdvice, setNutritionAdvice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'pre_workout', label: 'Pre-Workout' },
    { value: 'post_workout', label: 'Post-Workout' },
    { value: 'general', label: 'General Nutrition' }
  ];

  const dietaryRestrictions = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten_free', label: 'Gluten-Free' },
    { value: 'dairy_free', label: 'Dairy-Free' },
    { value: 'nut_free', label: 'Nut-Free' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'low_carb', label: 'Low-Carb' },
    { value: 'low_fat', label: 'Low-Fat' }
  ];

  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_gain', label: 'Muscle Gain' },
    { value: 'strength', label: 'Strength' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'general_health', label: 'General Health' }
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

  const handleRestrictionChange = (restriction) => {
    setUserProfile(prev => ({
      ...prev,
      dietary_restrictions: prev.dietary_restrictions.includes(restriction)
        ? prev.dietary_restrictions.filter(r => r !== restriction)
        : [...prev.dietary_restrictions, restriction]
    }));
  };

  const getNutritionAdvice = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/nutrition-advice`, {
        user_profile: userProfile,
        dietary_restrictions: userProfile.dietary_restrictions,
        meal_type: mealType
      });

      setNutritionAdvice(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while getting nutrition advice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>AI Nutrition Advisor</Header>
      
      <FormContainer>
        <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>
          Get Personalized Nutrition Advice
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
          <Label>Dietary Restrictions (select multiple)</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {dietaryRestrictions.map(restriction => (
              <label key={restriction.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={userProfile.dietary_restrictions.includes(restriction.value)}
                  onChange={() => handleRestrictionChange(restriction.value)}
                  style={{ marginRight: '8px' }}
                />
                {restriction.label}
              </label>
            ))}
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Meal Type</Label>
          <Select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            {mealTypes.map(meal => (
              <option key={meal.value} value={meal.value}>
                {meal.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <Button onClick={getNutritionAdvice} disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : null}
          {isLoading ? 'Getting Advice...' : 'Get Nutrition Advice'}
        </Button>
      </FormContainer>

      {error && (
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      )}

      {nutritionAdvice && (
        <NutritionAdviceContainer>
          <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>
            Your Personalized Nutrition Advice
          </h2>
          
          <div style={{ textAlign: 'center', marginBottom: '25px', color: '#666' }}>
            <p><strong>Meal Type:</strong> {nutritionAdvice.meal_type}</p>
          </div>

          {nutritionAdvice.nutrition_advice.map((meal, index) => (
            <MealCard key={index}>
              <MealTitle>{meal.meal_type}</MealTitle>
              
              <NutritionGrid>
                <NutritionItem>
                  <NutritionLabel>Calories</NutritionLabel>
                  <NutritionValue>{meal.calories}</NutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <NutritionLabel>Protein</NutritionLabel>
                  <NutritionValue>{meal.macronutrients.protein}g</NutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <NutritionLabel>Carbs</NutritionLabel>
                  <NutritionValue>{meal.macronutrients.carbs}g</NutritionValue>
                </NutritionItem>
                <NutritionItem>
                  <NutritionLabel>Fat</NutritionLabel>
                  <NutritionValue>{meal.macronutrients.fat}g</NutritionValue>
                </NutritionItem>
              </NutritionGrid>

              <div>
                <strong>Food Items:</strong>
                <FoodList>
                  {meal.food_items.map((food, foodIndex) => (
                    <FoodItem key={foodIndex}>{food}</FoodItem>
                  ))}
                </FoodList>
              </div>

              <TimingInfo>
                <strong>Timing:</strong> {meal.timing}
              </TimingInfo>

              <div>
                <strong>Benefits:</strong>
                <BenefitsList>
                  {meal.benefits.map((benefit, benefitIndex) => (
                    <BenefitItem key={benefitIndex}>{benefit}</BenefitItem>
                  ))}
                </BenefitsList>
              </div>
            </MealCard>
          ))}
        </NutritionAdviceContainer>
      )}
    </Container>
  );
};

export default NutritionAdvisor;
