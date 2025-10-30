import requests
import json
import base64
import time
import cv2
import numpy as np
from PIL import Image
import io

class FitnessTrainerTester:
    """Test suite for AI Fitness Trainer API"""
    
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def test_health_check(self):
        """Test health check endpoint"""
        print("🔍 Testing health check...")
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check passed: {data}")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Health check error: {e}")
            return False
    
    def test_exercise_library(self):
        """Test exercise library endpoint"""
        print("🔍 Testing exercise library...")
        try:
            response = self.session.get(f"{self.base_url}/exercise-library")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Exercise library retrieved: {data['total_exercises']} exercises")
                return True
            else:
                print(f"❌ Exercise library failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Exercise library error: {e}")
            return False
    
    def create_test_image(self):
        """Create a test image for posture analysis"""
        # Create a simple test image
        img = np.zeros((480, 640, 3), dtype=np.uint8)
        img.fill(128)  # Gray background
        
        # Draw a simple stick figure (squat position)
        cv2.circle(img, (320, 100), 20, (255, 255, 255), -1)  # Head
        cv2.line(img, (320, 120), (320, 200), (255, 255, 255), 3)  # Body
        cv2.line(img, (320, 200), (280, 300), (255, 255, 255), 3)  # Left leg
        cv2.line(img, (320, 200), (360, 300), (255, 255, 255), 3)  # Right leg
        cv2.line(img, (320, 150), (280, 180), (255, 255, 255), 3)  # Left arm
        cv2.line(img, (320, 150), (360, 180), (255, 255, 255), 3)  # Right arm
        
        # Convert to PIL Image
        pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        
        # Convert to base64
        buffer = io.BytesIO()
        pil_img.save(buffer, format='JPEG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return img_str
    
    def test_posture_analysis(self):
        """Test posture analysis endpoint"""
        print("🔍 Testing posture analysis...")
        try:
            # Create test image
            test_image = self.create_test_image()
            
            # Test data - convert to multipart form data
            files = {
                'file': ('test_image.jpg', base64.b64decode(test_image), 'image/jpeg')
            }
            data = {
                'exercise_type': 'squat'
            }
            
            start_time = time.time()
            response = self.session.post(
                f"{self.base_url}/analyze-posture",
                files=files,
                data=data
            )
            analysis_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Posture analysis passed")
                print(f"   Form Score: {data['form_score']:.2f}")
                print(f"   Confidence: {data['confidence']:.2f}")
                print(f"   Analysis Time: {analysis_time*1000:.2f}ms")
                print(f"   Corrections: {len(data['corrections'])}")
                return True
            else:
                print(f"❌ Posture analysis failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Posture analysis error: {e}")
            return False
    
    def test_workout_plan(self):
        """Test workout plan generation"""
        print("🔍 Testing workout plan generation...")
        try:
            test_data = {
                "user_profile": {
                    "age": 25,
                    "fitness_level": "beginner"
                },
                "goals": ["weight_loss", "strength"],
                "available_equipment": ["bodyweight"],
                "workout_duration": 30
            }
            
            response = self.session.post(
                f"{self.base_url}/workout-plan",
                json=test_data
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Workout plan generated")
                print(f"   Total Exercises: {data['total_exercises']}")
                print(f"   Estimated Duration: {data['estimated_duration']} minutes")
                return True
            else:
                print(f"❌ Workout plan failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Workout plan error: {e}")
            return False
    
    def test_nutrition_advice(self):
        """Test nutrition advice generation"""
        print("🔍 Testing nutrition advice...")
        try:
            test_data = {
                "user_profile": {
                    "age": 25,
                    "fitness_level": "beginner"
                },
                "dietary_restrictions": [],
                "meal_type": "breakfast"
            }
            
            response = self.session.post(
                f"{self.base_url}/nutrition-advice",
                json=test_data
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Nutrition advice generated")
                print(f"   Meal Type: {data['meal_type']}")
                print(f"   Advice Count: {len(data['nutrition_advice'])}")
                return True
            else:
                print(f"❌ Nutrition advice failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Nutrition advice error: {e}")
            return False
    
    def run_performance_test(self, num_requests=10):
        """Run performance test with multiple requests"""
        print(f"🔍 Running performance test ({num_requests} requests)...")
        
        test_image = self.create_test_image()
        test_data = {
            "image": test_image,
            "exercise_type": "squat"
        }
        
        times = []
        success_count = 0
        
        for i in range(num_requests):
            try:
                files = {
                    'file': ('test_image.jpg', base64.b64decode(test_image), 'image/jpeg')
                }
                data = {
                    'exercise_type': 'squat'
                }
                
                start_time = time.time()
                response = self.session.post(
                    f"{self.base_url}/analyze-posture",
                    files=files,
                    data=data
                )
                end_time = time.time()
                
                if response.status_code == 200:
                    success_count += 1
                    times.append(end_time - start_time)
                
                print(f"   Request {i+1}/{num_requests}: {response.status_code}")
                
            except Exception as e:
                print(f"   Request {i+1}/{num_requests}: Error - {e}")
        
        if times:
            avg_time = sum(times) / len(times)
            min_time = min(times)
            max_time = max(times)
            
            print(f"✅ Performance test completed")
            print(f"   Success Rate: {success_count}/{num_requests} ({success_count/num_requests*100:.1f}%)")
            print(f"   Average Time: {avg_time*1000:.2f}ms")
            print(f"   Min Time: {min_time*1000:.2f}ms")
            print(f"   Max Time: {max_time*1000:.2f}ms")
            
            # Check if we meet the <200ms requirement
            if avg_time < 0.2:
                print("✅ Meets <200ms latency requirement!")
            else:
                print("⚠️  Does not meet <200ms latency requirement")
            
            return True
        else:
            print("❌ Performance test failed - no successful requests")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("🧪 Starting AI Fitness Trainer Test Suite")
        print("=" * 50)
        
        tests = [
            ("Health Check", self.test_health_check),
            ("Exercise Library", self.test_exercise_library),
            ("Posture Analysis", self.test_posture_analysis),
            ("Workout Plan", self.test_workout_plan),
            ("Nutrition Advice", self.test_nutrition_advice),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n📋 {test_name}")
            print("-" * 30)
            if test_func():
                passed += 1
            time.sleep(1)  # Brief pause between tests
        
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
            
            # Run performance test
            print("\n🚀 Running Performance Test")
            print("-" * 30)
            self.run_performance_test(5)  # Reduced for demo
            
        else:
            print("❌ Some tests failed. Please check the logs above.")
        
        return passed == total

def main():
    """Main test function"""
    import sys
    
    # Check command line arguments
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://localhost:8000"
    
    print(f"🎯 Testing API at: {base_url}")
    
    tester = FitnessTrainerTester(base_url)
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ All tests completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
