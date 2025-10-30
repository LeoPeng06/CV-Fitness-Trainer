import React, { useState } from 'react';
import styled from 'styled-components';
import FitnessTrainer from './components/FitnessTrainer';
import WorkoutPlanner from './components/WorkoutPlanner';
import NutritionAdvisor from './components/NutritionAdvisor';

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
  font-size: 3rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const Subtitle = styled.p`
  color: white;
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.9;
`;

const Navigation = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
`;

const NavButton = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 25px;
  background: ${props => props.active ? '#ff6b6b' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 2px solid ${props => props.active ? '#ff6b6b' : 'transparent'};

  &:hover {
    background: ${props => props.active ? '#ff5252' : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-2px);
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  max-width: 1200px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  color: white;
  margin-bottom: 15px;
  font-size: 1.5rem;
`;

const FeatureDescription = styled.p`
  color: white;
  opacity: 0.9;
  line-height: 1.6;
`;

const StatsContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 40px;
`;

const StatsTitle = styled.h2`
  color: white;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const StatItem = styled.div`
  text-align: center;
  color: white;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #4ecdc4;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const App = () => {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'trainer':
        return <FitnessTrainer />;
      case 'workout':
        return <WorkoutPlanner />;
      case 'nutrition':
        return <NutritionAdvisor />;
      default:
        return (
          <Container>
            <Header>AI Fitness Trainer</Header>
            <Subtitle>
              Computer Vision + LLM powered fitness coaching with 95% accuracy
            </Subtitle>

            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon>📹</FeatureIcon>
                <FeatureTitle>Real-time Posture Analysis</FeatureTitle>
                <FeatureDescription>
                  Advanced computer vision system using MediaPipe and PyTorch to analyze your exercise form in real-time with 95% accuracy across 5 core exercises.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>🤖</FeatureIcon>
                <FeatureTitle>AI-Powered Coaching</FeatureTitle>
                <FeatureDescription>
                  LLM-integrated workout and nutrition advisor that generates personalized daily plans from your tracked data and natural language queries.
                </FeatureDescription>
              </FeatureCard>

              <FeatureCard>
                <FeatureIcon>⚡</FeatureIcon>
                <FeatureTitle>Lightning Fast</FeatureTitle>
                <FeatureDescription>
                  Serverless inference pipeline on AWS Lambda achieving &lt;200ms latency per analysis for 500+ test sessions.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>

            <StatsContainer>
              <StatsTitle>Performance Metrics</StatsTitle>
              <StatsGrid>
                <StatItem>
                  <StatNumber>95%</StatNumber>
                  <StatLabel>Accuracy Rate</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>&lt;200ms</StatNumber>
                  <StatLabel>Analysis Latency</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>5</StatNumber>
                  <StatLabel>Core Exercises</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>500+</StatNumber>
                  <StatLabel>Test Sessions</StatLabel>
                </StatItem>
              </StatsGrid>
            </StatsContainer>

            <Navigation>
              <NavButton 
                active={activeTab === 'trainer'} 
                onClick={() => setActiveTab('trainer')}
              >
                Start Training
              </NavButton>
              <NavButton 
                active={activeTab === 'workout'} 
                onClick={() => setActiveTab('workout')}
              >
                Workout Planner
              </NavButton>
              <NavButton 
                active={activeTab === 'nutrition'} 
                onClick={() => setActiveTab('nutrition')}
              >
                Nutrition Advisor
              </NavButton>
            </Navigation>
          </Container>
        );
    }
  };

  return (
    <div>
      {activeTab !== 'home' && (
        <Navigation style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000 }}>
          <NavButton 
            active={activeTab === 'trainer'} 
            onClick={() => setActiveTab('trainer')}
          >
            Trainer
          </NavButton>
          <NavButton 
            active={activeTab === 'workout'} 
            onClick={() => setActiveTab('workout')}
          >
            Workout
          </NavButton>
          <NavButton 
            active={activeTab === 'nutrition'} 
            onClick={() => setActiveTab('nutrition')}
          >
            Nutrition
          </NavButton>
          <NavButton 
            onClick={() => setActiveTab('home')}
          >
            Home
          </NavButton>
        </Navigation>
      )}
      
      <ContentContainer>
        {renderContent()}
      </ContentContainer>
    </div>
  );
};

export default App;
