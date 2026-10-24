import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Login from './Login';

const API_URL = "https://student-management-system-api-1hsh.onrender.com";
const EMPTY_STUDENT_FORM = {
  username: '',
  password: '',
  roll_number: '',
  full_name: '',
  email: '',
  phone: '',
  course: 'B.Tech CSE',
  semester: '1',
};

function App() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [activePage, setActivePage] = useState('Dashboard');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [studentForm, setStudentForm] = useState({
    ...EMPTY_STUDENT_FORM,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  useEffect(() => {
  const checkLogin = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/me/`,
        { withCredentials: true }
      );

      setCurrentUser(response.data);
    } catch {
      setCurrentUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  checkLogin();
}, []);

  // Fetch dashboard data from Django.
  const fetchData = async () => {
    try {
      setError('');

      const [
        studentsRes,
        subjectsRes,
        marksRes,
        attendanceRes,
      ] = await Promise.all([
  axios.get(`${API_URL}/api/students/`, {
    withCredentials: true,
  }),
  axios.get(`${API_URL}/api/subjects/`, {
    withCredentials: true,
  }),
  axios.get(`${API_URL}/api/subjects/marks/`, {
    withCredentials: true,
  }),
  axios.get(`${API_URL}/api/attendance/`, {
    withCredentials: true,
  }),
]);

      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
      setMarks(marksRes.data);
      setAttendance(attendanceRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);

      setError(
        'Unable to load dashboard data. Please check your Django server and API URLs.'
      );
    }
  };

  useEffect(() => {
    if (!authChecking && currentUser) {
      fetchData();
    }
  }, [authChecking, currentUser]);

  if (authChecking) {
    return <p>Checking login...</p>;
  }

  if (!currentUser) {
    return (
      <Login
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    );
  }

  const menuItems = [
    { name: 'Dashboard', icon: '▦' },
    { name: 'Students', icon: '♙' },
    { name: 'Subjects', icon: '▤' },
    { name: 'Marks', icon: '✎' },
    { name: 'Attendance', icon: '◷' },
  ];

  // Filter students using name, roll number, or email.
  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();

    return (
      (student.full_name || '').toLowerCase().includes(search) ||
      (student.roll_number || '').toLowerCase().includes(search) ||
      (student.email || '').toLowerCase().includes(search)
    );
  });

  // Update individual form fields.
  const handleStudentFormChange = (event) => {
    const { name, value } = event.target;

    setStudentForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Submit a new student to Django.
 

const handleStudentSubmit = async (event) => {
  event.preventDefault();

  setFormMessage('');
  setFormMessageType('');
  setIsSubmitting(true);

  try {
    const csrfResponse = await axios.get(
      `${API_URL}/api/auth/csrf/`,
      { withCredentials: true }
    );

    const csrfToken = csrfResponse.data.csrfToken;

    if (!csrfToken) {
      throw new Error('Django did not return a CSRF token.');
    }

    const response = await axios.post(
      `${API_URL}/api/students/create/`,
      {
        ...studentForm,
        semester: Number(studentForm.semester),
      },
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrfToken,
        },
      }
    );

    setStudents((previousStudents) => [
      ...previousStudents,
      response.data,
    ]);

    setStudentForm({ ...EMPTY_STUDENT_FORM });
    setShowStudentForm(false);
    setSearchTerm('');

    setFormMessage('Student registered successfully!');
    setFormMessageType('success');
  } catch (err) {
    console.error('Error registering student:', err);

    const responseData = err.response?.data;

    setFormMessage(
      responseData?.detail ||
      err.message ||
      'Unable to register student.'
    );

    setFormMessageType('error');
  } finally {
    setIsSubmitting(false);
  }
};




  // Start editing a student.
const handleEditStudent = (student) => {
  setEditingStudentId(student.id);
  setStudentForm({
    username: '',
    password: '',
    roll_number: student.roll_number || '',
    full_name: student.full_name || '',
    email: student.email || '',
    phone: student.phone || '',
    course: student.course || '',
    semester: String(student.semester || 1),
  });

  setFormMessage('');
  setFormMessageType('');
  setShowStudentForm(true);
};

// Save the updated student.
const handleUpdateStudent = async (event) => {
  event.preventDefault();

  setFormMessage('');
  setFormMessageType('');
  setIsSubmitting(true);

  try {
    const response = await axios.patch(
      `${API_URL}/api/students/${editingStudentId}/update/`,
      {
        roll_number: studentForm.roll_number,
        full_name: studentForm.full_name,
        email: studentForm.email,
        phone: studentForm.phone,
        course: studentForm.course,
        semester: Number(studentForm.semester),
      },
      {
        withCredentials: true,
        withXSRFToken: true,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFToken',
      }
    );

    setStudents((previousStudents) =>
      previousStudents.map((student) =>
        student.id === editingStudentId ? response.data : student
      )
    );

    setStudentForm({ ...EMPTY_STUDENT_FORM });
    setEditingStudentId(null);
    setShowStudentForm(false);
    setFormMessage('Student updated successfully!');
    setFormMessageType('success');
  } catch (err) {
    console.error('Error updating student:', err);
    const data = err.response?.data;

    setFormMessage(
      data && typeof data === 'object'
        ? Object.entries(data)
            .map(([field, value]) =>
              `${field}: ${Array.isArray(value) ? value.join(', ') : JSON.stringify(value)}`
            )
            .join(' | ')
        : 'Unable to update student. Check your login and Django server.'
    );
    setFormMessageType('error');
  } finally {
    setIsSubmitting(false);
  }
};

// Delete a student.
const handleDeleteStudent = async (student) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${student.full_name}?`
  );

  if (!confirmed) return;

  setIsDeleting(true);
  setFormMessage('');
  setFormMessageType('');

  try {
    await axios.delete(
      `${API_URL}/api/students/${student.id}/delete/`,
      {
        withCredentials: true,
        withXSRFToken: true,
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFToken',
      }
    );

    setStudents((previousStudents) =>
      previousStudents.filter((item) => item.id !== student.id)
    );

    setFormMessage('Student deleted successfully.');
    setFormMessageType('success');
  } catch (err) {
    console.error('Error deleting student:', err);
    setFormMessage(
      err.response?.status === 401 || err.response?.status === 403
        ? 'Permission denied. Please log in to Django Admin as a staff user.'
        : 'Unable to delete student. Check the Django server and API.'
    );
    setFormMessageType('error');
  } finally {
    setIsDeleting(false);
  }
};

  const renderContent = () => {
    switch (activePage) {
      case 'Students':
        return (
          <>
            <div className="students-heading">
              <div>
                <h2>Students</h2>
                <p>Search and manage student records.</p>
              </div>

              <input
                type="text"
                className="search-input"
                placeholder="Search name, roll number, or email..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              <button
                type="button"
                onClick={() => {
                  setShowStudentForm((previous) => !previous);
                  setFormMessage('');
                  setFormMessageType('');
                }}
              >
                {showStudentForm ? 'Cancel' : '+ Add Student'}
              </button>
            </div>

            {formMessage && (
              <div
                className={
                  formMessageType === 'success'
                    ? 'success-box'
                    : 'error-box'
                }
                role="status"
              >
                {formMessage}
              </div>
            )}

            {showStudentForm && (
              <div className="table-card student-form-card">
                <h2>{editingStudentId ? 'Edit Student' : 'Register New Student'}</h2>

                <form onSubmit={editingStudentId ? handleUpdateStudent : handleStudentSubmit}>
                  <div className="student-form-grid">
                    {!editingStudentId && (
                    <>
                    <label>
                      Username
                      <input
                        type="text"
                        name="username"
                        autoComplete="username"
                        required
                        value={studentForm.username}
                        onChange={handleStudentFormChange}
                      />
                    </label>

                    <label>
                      Password
                      <input
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={studentForm.password}
                        onChange={handleStudentFormChange}
                      />
                    </label>
                      </>
                )}

                    <label>
                      Roll Number
                      <input
                        type="text"
                        name="roll_number"
                        required
                        value={studentForm.roll_number}
                        onChange={handleStudentFormChange}
                      />
                    </label>

                    <label>
                      Full Name
                      <input
                        type="text"
                        name="full_name"
                        required
                        value={studentForm.full_name}
                        onChange={handleStudentFormChange}
                      />
                    </label>

                    <label>
                      Email
                      <input
                        type="email"
                        name="email"
                        required
                        value={studentForm.email}
                        onChange={handleStudentFormChange}
                      />
                    </label>

                    <label>
                      Phone
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={studentForm.phone}
                        onChange={handleStudentFormChange}
                      />
                    </label>

                    <label>
                      Course
                      <input
                        type="text"
                        name="course"
                        required
                        value={studentForm.course}
                        onChange={handleStudentFormChange}
                      />
                    </label>

                    <label>
                      Semester
                      <select
                        name="semester"
                        required
                        value={studentForm.semester}
                        onChange={handleStudentFormChange}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(
                          (semester) => (
                            <option
                              key={semester}
                              value={semester}
                            >
                              Semester {semester}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  </div>

                
                <button
                  type="submit"
                  className="student-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Saving...'
                    : editingStudentId
                      ? 'Update Student'
                      : 'Register Student'}
                </button>


                </form>
              </div>
            )}

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.roll_number}</td>
                      <td>{student.full_name}</td>
                      <td>{student.email}</td>
                      <td>{student.course}</td>
                      <td>{student.semester}</td>
                      <td className="student-actions">
                    <button
                      type="button"
                      onClick={() => handleEditStudent(student)}
                    >
                        Edit
                    </button>

                    <button
                     type="button"
                      disabled={isDeleting}
                      onClick={() => handleDeleteStudent(student)}
                    >
                      Delete
                    </button>
                    </td>
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="6">No students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'Subjects':
        return (
          <>
            <h2>Subjects</h2>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Subject Name</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Credits</th>
                  </tr>
                </thead>

                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.code}</td>
                      <td>{subject.name}</td>
                      <td>{subject.course}</td>
                      <td>{subject.semester}</td>
                      <td>{subject.credits}</td>
                    </tr>
                  ))}

                  {subjects.length === 0 && (
                    <tr>
                      <td colSpan="5">No subjects found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'Marks':
        return (
          <>
            <h2>Marks</h2>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Subject ID</th>
                    <th>Internal</th>
                    <th>External</th>
                    <th>Total</th>
                    <th>Grade</th>
                  </tr>
                </thead>

                <tbody>
                  {marks.map((mark) => (
                    <tr key={mark.id}>
                      <td>{mark.student}</td>
                      <td>{mark.subject}</td>
                      <td>{mark.internal_marks}</td>
                      <td>{mark.external_marks}</td>
                      <td>{mark.total_marks}</td>
                      <td>
                        <span className="badge">
                          {mark.grade}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {marks.length === 0 && (
                    <tr>
                      <td colSpan="6">No marks records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      case 'Attendance':
        return (
          <>
            <h2>Attendance</h2>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Subject ID</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id}>
                      <td>{record.student}</td>
                      <td>{record.subject}</td>
                      <td>{record.date}</td>
                      <td>
                        <span
                          className={`badge ${record.status}`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan="4">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );

      default:
        return (
          <>
            <div className="welcome">
              <div>
                <p className="eyebrow">OVERVIEW</p>
                <h2>Welcome to your dashboard 👋</h2>
                <p>
                  Manage students, subjects, marks, and attendance
                  in one place.
                </p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon blue">♙</div>
                <p>Total Students</p>
                <h3>{students.length}</h3>
                <span>Registered students</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">▤</div>
                <p>Total Subjects</p>
                <h3>{subjects.length}</h3>
                <span>Available subjects</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">✎</div>
                <p>Marks Records</p>
                <h3>{marks.length}</h3>
                <span>Records in the database</span>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">◷</div>
                <p>Attendance Records</p>
                <h3>{attendance.length}</h3>
                <span>Recorded attendance entries</span>
              </div>
            </div>

            <div className="section-heading">
              <h2>Student Directory</h2>

              <button
                onClick={() => setActivePage('Students')}
              >
                View all →
              </button>
            </div>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.roll_number}</td>
                      <td>{student.full_name}</td>
                      <td>{student.course}</td>
                      <td>{student.semester}</td>
                      <td>
                        <span className="badge present">
                          Registered
                        </span>
                      </td>
                    </tr>
                  ))}

                  {students.length === 0 && (
                    <tr>
                      <td colSpan="5">No students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        );
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>

          <div>
            <h2>StudentHub</h2>
            <span>Management System</span>
          </div>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? 'active' : ''
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-avatar">A</div>

          <div>
            <strong>Administrator</strong>
            <span>Student Portal</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Pages / {activePage}
            </p>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-right">
            <span className="status-dot"></span>
            <span>Backend connected</span>
          </div>
        </header>

        {error ? (
          <div className="error-box">{error}</div>
        ) : (
          <div className="page-content">
            {renderContent()}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

