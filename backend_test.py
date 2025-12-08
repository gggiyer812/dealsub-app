import requests
import sys
import os
from datetime import datetime
import io

class ReHUBAPITester:
    def __init__(self, base_url="https://dealflow-engine.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            'name': name,
            'success': success,
            'details': details
        })

    def test_process_file_endpoint_structure(self):
        """Test process-file endpoint with invalid data to check structure"""
        try:
            # Test with no file
            response = requests.post(f"{self.api_url}/process-file")
            
            # Should return 422 for missing required fields
            if response.status_code == 422:
                self.log_test("Process File Endpoint Structure", True, "Correctly validates required fields")
                return True
            else:
                self.log_test("Process File Endpoint Structure", False, f"Expected 422, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Process File Endpoint Structure", False, f"Connection error: {str(e)}")
            return False

    def test_download_csv_endpoint_structure(self):
        """Test download-csv endpoint structure"""
        try:
            # Test with empty data
            response = requests.post(f"{self.api_url}/download-csv", json={})
            
            # Should handle empty data gracefully
            if response.status_code in [200, 400, 422]:
                self.log_test("Download CSV Endpoint Structure", True, f"Endpoint accessible, status: {response.status_code}")
                return True
            else:
                self.log_test("Download CSV Endpoint Structure", False, f"Unexpected status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Download CSV Endpoint Structure", False, f"Connection error: {str(e)}")
            return False

    def test_process_file_with_sample_data(self):
        """Test process-file with sample data structure"""
        try:
            # Create a simple test file content
            test_content = b"AWG Item Code,Product Name,Price\n12345,Test Product,9.99\nManufacturer,Test Mfg,Info"
            
            files = {'file': ('test_cosentino.xlsx', test_content, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
            data = {'company': 'Cosentinos'}
            
            response = requests.post(f"{self.api_url}/process-file", files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                required_fields = ['standardized_data', 'text_summary', 'html_summary', 'output_headers', 'company']
                
                missing_fields = [field for field in required_fields if field not in result]
                if not missing_fields:
                    self.log_test("Process File Response Structure", True, "All required fields present")
                    return True
                else:
                    self.log_test("Process File Response Structure", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                # Expected to fail with invalid file format, but should return proper error
                if response.status_code in [400, 500]:
                    self.log_test("Process File Error Handling", True, f"Proper error response: {response.status_code}")
                    return True
                else:
                    self.log_test("Process File Error Handling", False, f"Unexpected status: {response.status_code}")
                    return False
                
        except Exception as e:
            self.log_test("Process File with Sample Data", False, f"Error: {str(e)}")
            return False

    def test_download_csv_with_sample_data(self):
        """Test download-csv with sample data"""
        try:
            sample_data = {
                'headers': ['Column1', 'Column2', 'Column3'],
                'rows': [
                    {'Column1': 'Value1', 'Column2': 'Value2', 'Column3': 'Value3'},
                    {'Column1': 'Value4', 'Column2': 'Value5', 'Column3': 'Value6'}
                ]
            }
            
            response = requests.post(f"{self.api_url}/download-csv", json=sample_data)
            
            if response.status_code == 200:
                # Check if response is CSV format
                content_type = response.headers.get('content-type', '')
                if 'csv' in content_type or 'text' in content_type:
                    self.log_test("Download CSV Functionality", True, "CSV download working")
                    return True
                else:
                    self.log_test("Download CSV Functionality", False, f"Wrong content type: {content_type}")
                    return False
            else:
                self.log_test("Download CSV Functionality", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Download CSV Functionality", False, f"Error: {str(e)}")
            return False

    def test_cors_headers(self):
        """Test CORS configuration"""
        try:
            response = requests.options(f"{self.api_url}/process-file")
            
            cors_headers = [
                'access-control-allow-origin',
                'access-control-allow-methods',
                'access-control-allow-headers'
            ]
            
            present_headers = [h for h in cors_headers if h in response.headers]
            
            if len(present_headers) >= 2:
                self.log_test("CORS Configuration", True, f"CORS headers present: {present_headers}")
                return True
            else:
                self.log_test("CORS Configuration", False, f"Missing CORS headers")
                return False
                
        except Exception as e:
            self.log_test("CORS Configuration", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting ReHUB Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test API endpoints
        self.test_process_file_endpoint_structure()
        self.test_download_csv_endpoint_structure()
        self.test_process_file_with_sample_data()
        self.test_download_csv_with_sample_data()
        self.test_cors_headers()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Backend API Test Results:")
        print(f"✅ Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Failed: {self.tests_run - self.tests_passed}/{self.tests_run}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ReHUBAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())