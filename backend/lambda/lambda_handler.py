import json
import base64
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
import time
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our services
from services.posture_analyzer import PostureAnalyzer
from services.llm_advisor import LLMFitnessAdvisor

# Initialize services (these will be loaded once per Lambda container)
posture_analyzer = PostureAnalyzer()
llm_advisor = LLMFitnessAdvisor()

def lambda_handler(event, context):
    """
    AWS Lambda handler for AI Fitness Trainer API
    """
    try:
        # Parse the event
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '/')
        
        # Set CORS headers
        headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        }
        
        # Handle preflight requests
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight'})
            }
        
        # Route requests
        if path == '/health':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'status': 'healthy',
                    'timestamp': time.time(),
                    'lambda': True
                })
            }
        
        elif path == '/analyze-posture' and http_method == 'POST':
            return handle_posture_analysis(event, headers)
        
        elif path == '/workout-plan' and http_method == 'POST':
            return handle_workout_plan(event, headers)
        
        elif path == '/nutrition-advice' and http_method == 'POST':
            return handle_nutrition_advice(event, headers)
        
        elif path == '/exercise-library' and http_method == 'GET':
            return handle_exercise_library(headers)
        
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Not found'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }

def handle_posture_analysis(event, headers):
    """Handle posture analysis requests"""
    try:
        # Parse the request body
        body = json.loads(event.get('body', '{}'))
        
        # Get image data (base64 encoded)
        image_data = body.get('image')
        exercise_type = body.get('exercise_type', 'squat')
        
        if not image_data:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No image data provided'})
            }
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        image_array = np.array(image)
        
        # Convert PIL image to OpenCV format
        if len(image_array.shape) == 3:
            image_cv = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        else:
            image_cv = image_array
        
        # Analyze posture
        start_time = time.time()
        analysis = posture_analyzer.analyze_exercise_form(image_cv, exercise_type)
        analysis_time = time.time() - start_time
        
        # Generate LLM feedback
        feedback = llm_advisor.analyze_form_feedback(
            exercise_type, 
            analysis.form_score, 
            analysis.corrections
        )
        
        # Prepare response
        response = {
            "exercise_type": analysis.exercise_type,
            "confidence": analysis.confidence,
            "form_score": analysis.form_score,
            "is_correct_form": analysis.is_correct_form,
            "corrections": analysis.corrections,
            "key_points": analysis.key_points,
            "feedback": feedback,
            "analysis_time_ms": round(analysis_time * 1000, 2),
            "timestamp": time.time(),
            "lambda": True
        }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Error analyzing posture',
                'message': str(e)
            })
        }

def handle_workout_plan(event, headers):
    """Handle workout plan generation requests"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        user_profile = body.get("user_profile", {})
        goals = body.get("goals", ["general fitness"])
        available_equipment = body.get("available_equipment", ["bodyweight"])
        workout_duration = body.get("workout_duration", 30)
        
        # Generate workout plan
        workout_plans = llm_advisor.generate_workout_plan(
            user_profile=user_profile,
            goals=goals,
            available_equipment=available_equipment,
            workout_duration=workout_duration
        )
        
        # Convert to JSON-serializable format
        plans_data = []
        for plan in workout_plans:
            plans_data.append({
                "exercise_name": plan.exercise_name,
                "sets": plan.sets,
                "reps": plan.reps,
                "duration": plan.duration,
                "difficulty": plan.difficulty,
                "instructions": plan.instructions,
                "target_muscles": plan.target_muscles
            })
        
        response = {
            "workout_plans": plans_data,
            "total_exercises": len(plans_data),
            "estimated_duration": workout_duration,
            "timestamp": time.time(),
            "lambda": True
        }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Error generating workout plan',
                'message': str(e)
            })
        }

def handle_nutrition_advice(event, headers):
    """Handle nutrition advice requests"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        user_profile = body.get("user_profile", {})
        dietary_restrictions = body.get("dietary_restrictions", [])
        meal_type = body.get("meal_type", "general")
        
        # Generate nutrition advice
        nutrition_advice = llm_advisor.generate_nutrition_advice(
            user_profile=user_profile,
            dietary_restrictions=dietary_restrictions,
            meal_type=meal_type
        )
        
        # Convert to JSON-serializable format
        advice_data = []
        for advice in nutrition_advice:
            advice_data.append({
                "meal_type": advice.meal_type,
                "food_items": advice.food_items,
                "calories": advice.calories,
                "macronutrients": advice.macronutrients,
                "timing": advice.timing,
                "benefits": advice.benefits
            })
        
        response = {
            "nutrition_advice": advice_data,
            "meal_type": meal_type,
            "timestamp": time.time(),
            "lambda": True
        }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Error generating nutrition advice',
                'message': str(e)
            })
        }

def handle_exercise_library(headers):
    """Handle exercise library requests"""
    try:
        exercise_library = {
            "squat": {
                "name": "Squat",
                "muscles": ["quadriceps", "glutes", "hamstrings", "core"],
                "difficulty": "beginner",
                "equipment": "bodyweight",
                "description": "Lower body strength exercise targeting legs and glutes",
                "benefits": ["strength", "mobility", "functional movement"]
            },
            "pushup": {
                "name": "Push-up",
                "muscles": ["chest", "shoulders", "triceps", "core"],
                "difficulty": "beginner",
                "equipment": "bodyweight",
                "description": "Upper body strength exercise targeting chest and arms",
                "benefits": ["upper body strength", "core stability"]
            },
            "plank": {
                "name": "Plank",
                "muscles": ["core", "shoulders", "glutes"],
                "difficulty": "beginner",
                "equipment": "bodyweight",
                "description": "Isometric core strengthening exercise",
                "benefits": ["core strength", "stability", "endurance"]
            },
            "lunge": {
                "name": "Lunge",
                "muscles": ["quadriceps", "glutes", "hamstrings", "calves"],
                "difficulty": "beginner",
                "equipment": "bodyweight",
                "description": "Single-leg strength exercise for legs and glutes",
                "benefits": ["leg strength", "balance", "mobility"]
            },
            "deadlift": {
                "name": "Deadlift",
                "muscles": ["hamstrings", "glutes", "lower back", "traps"],
                "difficulty": "intermediate",
                "equipment": "barbell",
                "description": "Hip-hinge movement for posterior chain strength",
                "benefits": ["posterior chain strength", "functional movement"]
            }
        }
        
        response = {
            "exercises": exercise_library,
            "total_exercises": len(exercise_library),
            "timestamp": time.time(),
            "lambda": True
        }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Error retrieving exercise library',
                'message': str(e)
            })
        }
