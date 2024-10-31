## Queue Management
[![Unittest](https://github.com/ParimaSA/Queue_Management/actions/workflows/unittest.yml/badge.svg)](https://github.com/ParimaSA/Queue_Management/actions/workflows/unittest.yml)
[![Run Flake8](https://github.com/ParimaSA/Queue_Management/actions/workflows/run-flake8.yml/badge.svg)](https://github.com/ParimaSA/Queue_Management/actions/workflows/run-flake8.yml)
[![codecov](https://codecov.io/github/ParimaSA/Queue_Management/graph/badge.svg?token=B0XYTZRM1R)](https://codecov.io/github/ParimaSA/Queue_Management)


## Installation

1. Clone the project from Github
    ```
    git clone https://github.com/ParimaSA/Queue_Management.git
    ```
2. Open the project file in your IDE
3. Go to Queue_Management directory
    ```
    cd Queue_Management
    ```
4. Create your virtual environment
    ```
    python3 -m venv env
    ```
5. Activate virtual environment
   ```
   # On Mac/Linux
   source env/bin/activate
   
   # On Window
   env\Scripts\activate
   ```
6. Install requirements.txt
    ```
    pip install -r requirements.txt
    ```
7. Set environment variables
   ```
   # create .env file and copy from template: sample.env
   # On Mac/Linux
   cp sample.env .env
   
   # On Window
   copy sample.env .env
   ```
8. Replace SECRET_KEY with your own value
   ```
   # doing this in Python Shell
   from django.core.management.utils import get_random_secret_key
   
   # copy this value and replace SECRET_KEY in .env file
   print(get_random_secret_key())
   ```
9. Run Migrations
    ```
    python manage.py migrate
    ```
10. Load fixture data

11. Run tests
    ```
    python manage.py test
    ```
12. Run server
    ```
    python manage.py runserver
    ```

## Running the Application
1. Activate the virtual environment
    ```
    # on Mac/Linux
    source venv/bin/activate
    
    # on Window
    venv\Scripts\activate 
    ```
2. Start Django Development server
    ```
   # Recommended python version >= 3.11
    python manage.py runserver
    ```
If the port is not available, you can kill the port by following these steps:
   ```
   # Find the process using port 8000 on Mac/Linux
   sudo lsof -i :8000
   
   #kill the port using PID
   sudo kill -9 PID
   ```
   ```
   # Find the process using port 8000 on Window
   netstat -ano | findstr :8000
   
   #kill the port using PID
   taskkill /PID PID /F
   ```
3. Access the server on your browser http://127.0.0.1:8000/

## Project Documents
to be added.
