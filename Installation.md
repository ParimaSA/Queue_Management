## Installation Guide
1. Clone the repository
```commandline
git clone https://github.com/ParimaSA/Queue_Management.git
```

### Backend Installation
1. Navigate to the Backend directory
```commandline
cd backend
```

2. Create a virtual environment
```commandline
python3 -m venv env
```

3. Activate the virtual environment
    * On MS Window use
   ```commandline
    \env\Scripts\activate
   ```
   * On macOS and Linux use
   ```commandline
    source env/bin/activate
   ```

4. Install the requirements package
```commandline
pip install -r requirements.txt
```

5. Set value for externalized variable
   * On MS Window use
      ```commandline
       copy sample.env .env
      ```
   * On macOS and Linux use
     ```commandline
      cp sample.env .env
     ```
After that, change the values in the .env file.

6. Run migrations
```commandline
python3 manage.py migrate
```

7. Run tests
```commandline
python3 manage.py test
```

8. Run the Backend Server
```commandline
python3 manage.py runserver
```

If the port is not available, you can kill the port by following these steps:
```commandline
# Find the process using port 8000 on Mac/Linux
sudo lsof -i :8000

#kill the port using PID
sudo kill -9 PID
```

```commandline
# Find the process using port 8000 on Window
netstat -ano | findstr :8000

#kill the port using PID
taskkill /PID PID /F
```

### Frontend Installation
1. Navigate to the Frontend directory
```commandline
cd frontend
```
2. Install Dependencies
```commandline
npm install
```
3. Run the Frontend Development Server
```commandline
npm run dev
```
