// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import FormInput from '../components/forms/FormInput';
// import Button from '../components/forms/Button';
// import { addQuestion, updateQuestion, fetchQuestions } from '../api/apiService';

// export default function EditQuestionPage({ isNew }) {
//   const { questionId } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ text: '', options: '', correct: '' });

//   useEffect(() => {
//     if (!isNew && questionId) {
//       const loadQuestion = async () => {
//         try {
//           const res = await fetchQuestions();
//           const q = res.data.find((item) => item.id === parseInt(questionId));
//           if (q) {
//             setFormData({
//               text: q.text,
//               options: q.options.join(', '),
//               correct: q.correct,
//             });
//           }
//         } catch (err) {
//           console.error(err);
//         }
//       };
//       loadQuestion();
//     }
//   }, [isNew, questionId]);

//   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const payload = {
//       text: formData.text,
//       options: formData.options.split(',').map((opt) => opt.trim()),
//       correct: formData.correct,
//     };
//     try {
//       if (isNew) {
//         await addQuestion(payload);
//       } else {
//         await updateQuestion(questionId, payload);
//       }
//       alert('Question saved successfully!');
//       navigate('/professor/question');
//     } catch (err) {
//       alert('Error saving question.');
//     }
//   };

//   return (
//     // ✅ Use the 'main-content' class here
//     <main className="main-content">
//       <div className="card form-container">
//         <form onSubmit={handleSubmit}>
//           <h2 className="page-title">
//             {isNew ? 'Add New Question' : 'Edit Question'}
//           </h2>
//           <FormInput label="Question Text" name="text" value={formData.text} onChange={handleChange} />
//           <FormInput label="Options (comma separated)" name="options" value={formData.options} onChange={handleChange} />
//           <FormInput label="Correct Answer" name="correct" value={formData.correct} onChange={handleChange} />
//           <Button
//             type="submit"
//             label="Save Question"
//             className="btn btn-primary"
//             style={{ width: '100%', marginTop: '1rem' }}
//           />
//         </form>
//       </div>
//     </main>
//   );
// }


// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import FormInput from '../components/forms/FormInput';
// import Button from '../components/forms/Button';
// import { addQuestion, updateQuestion, fetchQuestions } from '../api/apiService';

// export default function EditQuestionPage({ isNew }) {
//   const { questionId } = useParams();
//   const navigate = useNavigate();

//   // Options is an array of 4 strings.
//   // 'correct' stores the INDEX as a string ("0", "1", "2", "3")
//   const [formData, setFormData] = useState({ 
//     text: '', 
//     options: ['', '', '', ''], 
//     correct: '' 
//   });

//   // 1. Load Data on Edit
//   useEffect(() => {
//     if (!isNew && questionId) {
//       const loadQuestion = async () => {
//         try {
//           const res = await fetchQuestions();
//           const q = res.data.find((item) => item.id === parseInt(questionId));
//           if (q) {
//             const loadedOptions = q.options || [];
//             while (loadedOptions.length < 4) loadedOptions.push("");

//             // Find which index matches the correct answer text
//             const correctIndex = loadedOptions.indexOf(q.correct);

//             setFormData({
//               text: q.text,
//               options: loadedOptions,
//               correct: correctIndex > -1 ? correctIndex.toString() : '', 
//             });
//           }
//         } catch (err) {
//           console.error(err);
//         }
//       };
//       loadQuestion();
//     }
//   }, [isNew, questionId]);

//   // 2. Input Handlers
//   const handleTextChange = (e) => {
//     setFormData({ ...formData, text: e.target.value });
//   };

//   const handleOptionChange = (index, value) => {
//     const newOptions = [...formData.options];
//     newOptions[index] = value;
//     setFormData({ ...formData, options: newOptions });
//   };

//   const handleCorrectChange = (e) => {
//     setFormData({ ...formData, correct: e.target.value });
//   };

//   // ✅ 3. UPDATED HANDLE SUBMIT (Strict Validation)
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation 1: Check Question Text
//     if (!formData.text.trim()) {
//       alert("Please enter the Question Text.");
//       return;
//     }

//     // Validation 2: Check if ANY of the 4 options are empty
//     // This ensures all 4 boxes must be filled
//     if (formData.options.some(opt => opt.trim() === "")) {
//         alert("All 4 options are mandatory. Please fill them all in.");
//         return;
//     }

//     // Validation 3: Check Correct Answer
//     if (formData.correct === '') {
//         alert("Please select the Correct Answer from the dropdown.");
//         return;
//     }

//     // Convert the selected "Index" back to "Text"
//     const selectedIndex = parseInt(formData.correct);
//     const correctAnsText = formData.options[selectedIndex];

//     const payload = {
//       text: formData.text,
//       options: formData.options, 
//       correct: correctAnsText,
//     };

//     try {
//       if (isNew) {
//         await addQuestion(payload);
//       } else {
//         await updateQuestion(questionId, payload);
//       }
//       alert('Question saved successfully!');
//       navigate('/professor/questions'); 
//     } catch (err) {
//       alert('Error saving question.');
//       console.error(err);
//     }
//   };

//   return (
//     <main className="main-content">
//       <div className="card form-container">
//         <form onSubmit={handleSubmit}>
//           <h2 className="page-title">
//             {isNew ? 'Add New Question' : 'Edit Question'}
//           </h2>

//           {/* Question Text */}
//           <FormInput 
//             label="Question Text" 
//             name="text" 
//             value={formData.text} 
//             onChange={handleTextChange} 
//             required 
//           />

//           <h4 style={{marginTop: '20px', marginBottom: '10px'}}>Options</h4>
          
//           {/* Loop to create 4 Input Boxes */}
//           {formData.options.map((option, index) => (
//             <FormInput
//               key={index}
//               label={`Option ${index + 1}`}
//               name={`option-${index}`}
//               value={option}
//               onChange={(e) => handleOptionChange(index, e.target.value)}
//               required 
//             />
//           ))}

//           {/* Dropdown */}
//           <div style={{ marginBottom: '1.5rem' }}>
//             <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
//               Correct Answer
//             </label>
//             <select
//               value={formData.correct}
//               onChange={handleCorrectChange}
//               required
//               style={{
//                 width: '100%',
//                 padding: '10px',
//                 borderRadius: '5px',
//                 border: '1px solid #ccc',
//                 backgroundColor: '#fff'
//               }}
//             >
//               <option value="">-- Select Correct Answer --</option>
              
//               {/* Options 1-4 Dropdown */}
//               {formData.options.map((_, index) => (
//                  <option key={index} value={index}>
//                     Option {index + 1}
//                  </option>
//               ))}
//             </select>
//           </div>

//           <Button
//             type="submit"
//             label="Save Question"
//             className="btn btn-primary"
//             style={{ width: '100%', marginTop: '1rem' }}
//           />
//         </form>
//       </div>
//     </main>
//   );
// }


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../components/forms/FormInput';
import Button from '../components/forms/Button';
import { addQuestion, updateQuestion, fetchQuestions } from '../api/apiService';

export default function EditQuestionPage({ isNew }) {
  const { questionId } = useParams();
  const navigate = useNavigate();

  // Options is an array of 4 strings.
  // 'correct' stores the INDEX as a string ("0", "1", "2", "3")
  const [formData, setFormData] = useState({ 
    text: '', 
    options: ['', '', '', ''], 
    correct: '' 
  });

  // 1. Load Data on Edit
  useEffect(() => {
    if (!isNew && questionId) {
      const loadQuestion = async () => {
        try {
          const res = await fetchQuestions();
          const q = res.data.find((item) => item.id === parseInt(questionId));
          if (q) {
            const loadedOptions = q.options || [];
            while (loadedOptions.length < 4) loadedOptions.push("");

            // Find which index matches the correct answer text
            const correctIndex = loadedOptions.indexOf(q.correct);

            setFormData({
              text: q.text,
              options: loadedOptions,
              correct: correctIndex > -1 ? correctIndex.toString() : '', 
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      loadQuestion();
    }
  }, [isNew, questionId]);

  // 2. Input Handlers
  const handleTextChange = (e) => {
    setFormData({ ...formData, text: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectChange = (e) => {
    setFormData({ ...formData, correct: e.target.value });
  };

  // 3. Updated Handle Submit (Strict Validation)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation 1: Check Question Text
    if (!formData.text.trim()) {
      alert("Please enter the Question Text.");
      return;
    }

    // Validation 2: Check if ANY of the 4 options are empty
    if (formData.options.some(opt => opt.trim() === "")) {
        alert("All 4 options are mandatory. Please fill them all in.");
        return;
    }

    // Validation 3: Check Correct Answer
    if (formData.correct === '') {
        alert("Please select the Correct Answer from the dropdown.");
        return;
    }

    // Convert the selected "Index" back to "Text"
    const selectedIndex = parseInt(formData.correct);
    const correctAnsText = formData.options[selectedIndex];

    const payload = {
      text: formData.text,
      options: formData.options, 
      correct: correctAnsText,
    };

    try {
      if (isNew) {
        await addQuestion(payload);
      } else {
        await updateQuestion(questionId, payload);
      }
      alert('Question saved successfully!');
      navigate('/professor/questions'); 
    } catch (err) {
      alert('Error saving question.');
      console.error(err);
    }
  };

  return (
    // ✅ THIS IS THE LINE THAT CENTERS THE CARD
    <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      
      <div className="card form-container">
        <form onSubmit={handleSubmit}>
          <h2 className="page-title">
            {isNew ? 'Add New Question' : 'Edit Question'}
          </h2>

          {/* Question Text */}
          <FormInput 
            label="Question Text" 
            name="text" 
            value={formData.text} 
            onChange={handleTextChange} 
            required 
          />

          <h4 style={{marginTop: '20px', marginBottom: '10px'}}>Options</h4>
          
          {/* Loop to create 4 Input Boxes */}
          {formData.options.map((option, index) => (
            <FormInput
              key={index}
              label={`Option ${index + 1}`}
              name={`option-${index}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              required 
            />
          ))}

          {/* Dropdown */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Correct Answer
            </label>
            <select
              value={formData.correct}
              onChange={handleCorrectChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff'
              }}
            >
              <option value="">-- Select Correct Answer --</option>
              
              {/* Options 1-4 Dropdown */}
              {formData.options.map((_, index) => (
                 <option key={index} value={index}>
                    Option {index + 1}
                 </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            label="Save Question"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          />
        </form>
      </div>
    </main>
  );
}