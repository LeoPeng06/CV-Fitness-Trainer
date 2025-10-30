import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Webcam from 'react-webcam';
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

const CameraContainer = styled.div`
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  margin-bottom: 30px;
`;

const WebcamStyled = styled(Webcam)`
  width: 640px;
  height: 480px;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  background: ${props => props.primary ? '#ff6b6b' : '#4ecdc4'};
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Select = styled.select`
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  background: white;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const AnalysisContainer = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-width: 600px;
  width: 100%;
`;

const ScoreDisplay = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const ScoreCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => {
    if (props.score >= 0.8) return 'linear-gradient(135deg, #4CAF50, #45a049)';
    if (props.score >= 0.6) return 'linear-gradient(135deg, #FF9800, #F57C00)';
    return 'linear-gradient(135deg, #F44336, #D32F2F)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
`;

const StatusText = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${props => {
    if (props.score >= 0.8) return '#4CAF50';
    if (props.score >= 0.6) return '#FF9800';
    return '#F44336';
  }};
`;

const CorrectionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
`;

const CorrectionItem = styled.li`
  background: #f8f9fa;
  padding: 12px 15px;
  margin: 8px 0;
  border-radius: 8px;
  border-left: 4px solid #ff6b6b;
  font-size: 14px;
`;

const FeedbackText = styled.div`
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  font-style: italic;
  color: #1976d2;
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

const FitnessTrainer = () => {
  const webcamRef = useRef(null);
  const [selectedExercise, setSelectedExercise] = useState('squat');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const exercises = [
    { value: 'squat', label: 'Squat' },
    { value: 'pushup', label: 'Push-up' },
    { value: 'plank', label: 'Plank' },
    { value: 'lunge', label: 'Lunge' },
    { value: 'deadlift', label: 'Deadlift' }
  ];

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      return imageSrc;
    }
    return null;
  };

  const analyzePosture = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const imageSrc = captureImage();
      if (!imageSrc) {
        throw new Error('Could not capture image from camera');
      }

      // Convert base64 to blob
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('exercise_type', selectedExercise);

      // Send to backend
      const result = await axios.post(`${API_BASE_URL}/analyze-posture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisResult(result.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startContinuousAnalysis = () => {
    setIsCapturing(true);
    const interval = setInterval(() => {
      if (!isAnalyzing) {
        analyzePosture();
      }
    }, 2000); // Analyze every 2 seconds

    // Store interval ID for cleanup
    webcamRef.current.intervalId = interval;
  };

  const stopContinuousAnalysis = () => {
    setIsCapturing(false);
    if (webcamRef.current?.intervalId) {
      clearInterval(webcamRef.current.intervalId);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const getScoreText = (score) => {
    if (score >= 0.8) return 'Excellent Form!';
    if (score >= 0.6) return 'Good Form';
    if (score >= 0.4) return 'Needs Improvement';
    return 'Poor Form';
  };

  return (
    <Container>
      <Header>AI Fitness Trainer</Header>
      
      <CameraContainer>
        <WebcamStyled
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user"
          }}
        />
      </CameraContainer>

      <Controls>
        <Select 
          value={selectedExercise} 
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          {exercises.map(exercise => (
            <option key={exercise.value} value={exercise.value}>
              {exercise.label}
            </option>
          ))}
        </Select>
        
        <Button onClick={analyzePosture} disabled={isAnalyzing}>
          {isAnalyzing ? <LoadingSpinner /> : null}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Posture'}
        </Button>
        
        <Button 
          onClick={isCapturing ? stopContinuousAnalysis : startContinuousAnalysis}
          primary={isCapturing}
        >
          {isCapturing ? 'Stop Continuous' : 'Start Continuous'}
        </Button>
      </Controls>

      {error && (
        <ErrorMessage>
          <strong>Error:</strong> {error}
        </ErrorMessage>
      )}

      {analysisResult && (
        <AnalysisContainer>
          <ScoreDisplay>
            <ScoreCircle score={analysisResult.form_score}>
              {Math.round(analysisResult.form_score * 100)}%
            </ScoreCircle>
            <StatusText score={analysisResult.form_score}>
              {getScoreText(analysisResult.form_score)}
            </StatusText>
            <p>Analysis Time: {analysisResult.analysis_time_ms}ms</p>
          </ScoreDisplay>

          {analysisResult.corrections && analysisResult.corrections.length > 0 && (
            <div>
              <h3>Form Corrections:</h3>
              <CorrectionsList>
                {analysisResult.corrections.map((correction, index) => (
                  <CorrectionItem key={index}>
                    {correction}
                  </CorrectionItem>
                ))}
              </CorrectionsList>
            </div>
          )}

          {analysisResult.feedback && (
            <FeedbackText>
              <strong>Coach Feedback:</strong><br />
              {analysisResult.feedback}
            </FeedbackText>
          )}

          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p><strong>Exercise:</strong> {analysisResult.exercise_type}</p>
            <p><strong>Confidence:</strong> {Math.round(analysisResult.confidence * 100)}%</p>
            <p><strong>Correct Form:</strong> {analysisResult.is_correct_form ? 'Yes' : 'No'}</p>
          </div>
        </AnalysisContainer>
      )}
    </Container>
  );
};

export default FitnessTrainer;
