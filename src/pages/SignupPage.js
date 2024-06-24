import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import '../css/Signup.css'; 
import logoImage from '../logo.png';
import { useAuth } from '../context/AuthContext';

function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;

    console.log("Google Login Success, credential:", credential);

    try {
      const data = await makeFetchRequest('https://moviely.duckdns.org/api/login', { token: credential });

      console.log("Backend response data:", data);

      if (data.jwtToken) {
        login(data.jwtToken, data.user);
        navigate('/movie-select');
      } else {
        alert('로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Backend redirection failed:', error);
      alert('백엔드 처리에 실패했습니다.');
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google Login Failed:', error);
    alert('Google 로그인에 실패했습니다.');
  };

  const handleAddInfo = async (e) => {
    e.preventDefault();

    if (!age) {
      alert("나이를 입력해주세요.");
      return;
    }

    const addInfoData = {
      gender: gender,
      age: parseInt(age, 10)
    };

    if (isNaN(addInfoData.age) || addInfoData.age <= 0) {
      alert("유효한 나이를 입력해주세요.");
      return;
    }

    console.log("Add Info Data: ", JSON.stringify(addInfoData));

    try {
      console.log("Making HTTPS request to update info");
      const data = await makeFetchRequest('https://moviely.duckdns.org/update-info', addInfoData);

      console.log('Data from server:', data);

      if (data.success) {
        navigate('/movie-select');
      } else {
        alert('정보 입력 실패: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버와의 연결에 문제가 발생했습니다.');
    }
  };

  const makeFetchRequest = async (url, body) => {
    const response = await fetch(url, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const ageOptions = useMemo(() => {
    const options = [];
    for (let i = 15; i <= 100; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  }, []);

  return (
    <div className="signUpPage">
      <Link to="/" className="signUp-logo">
        <img src={logoImage} alt="Logo" />
      </Link>
      <div className="signUpBox">
        <h2>회원가입</h2>
        <p>보다 정확한 맞춤 영화 추천 서비스를 위해<br />나이와 성별을 입력해주세요.</p>
        <form onSubmit={handleAddInfo}>
          <div className="inputGroup">
            <label htmlFor="gender">성별</label>
            <select
              id="gender"
              name="gender"
              className="genderSelect"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="" disabled>성별을 선택해주세요</option>
              <option value="female">여성</option>
              <option value="male">남성</option>
            </select>
          </div>
          <div className="inputGroup">
            <label htmlFor="age">나이</label>
            <select
              id="age"
              name="age"
              className="ageSelect"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            >
              <option value="" disabled>나이를 선택해주세요</option>
              {ageOptions}
            </select>
          </div>
          <button type="submit" className="addButton">정보 입력하기</button>
        </form>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
        />
        <p className="redirect-text">
          이미 MOVIELY 계정이 있으신가요? <Link to="/login" className="redirect-link">로그인하러가기</Link>
        </p>
      </div>
    </div>
  );
}