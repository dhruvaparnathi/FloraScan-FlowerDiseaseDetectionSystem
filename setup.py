#!/usr/bin/env python3
"""
Setup script for Flower Disease Detection project
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Error in {description}:")
        print(f"Command: {command}")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("✗ Python 3.8 or higher is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def main():
    print("🌸 Flower Disease Detection - Setup Script")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("\nTrying with --user flag...")
        if not run_command("pip install --user -r requirements.txt", "Installing Python dependencies (user)"):
            return False
    
    # Test model loading
    if os.path.exists("test_model.py"):
        print("\n🧪 Testing model loading...")
        if run_command("python test_model.py", "Model test"):
            print("\n✅ Setup completed successfully!")
            print("\nNext steps:")
            print("1. Start backend: cd backend && python app.py")
            print("2. Start frontend: cd client && npm install && npm start")
            print("3. Open http://localhost:3000 in your browser")
        else:
            print("\n⚠️  Setup completed but model test failed")
            print("Please check the error messages above")
    else:
        print("\n✅ Dependencies installed successfully!")
        print("Model test script not found, but dependencies are ready")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            print("\n❌ Setup failed. Please check the error messages above.")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)