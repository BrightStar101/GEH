import React, { useActionState, useContext, useEffect, useState } from 'react';
import FormStepper from '../../components/user/FormStepper';
import Mira from '../public/Mira';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../contexts/AuthContext';
import ConfirmDownloadModal from '../../components/user/FormConfirmModal';
import ReviewModal from '../../components/user/ReviewModal';
import { formAvailable } from '../../utils/pricingConfig';

export default function FormPage() {
  const { formId, language } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentForm, setCurrentForm] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLast, setIsLast] = useState(false);
  const [answers, setAnswers] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [formid, setFormId] = useState(null);

  const getNext = async (allAnswers) => {
    try {
      const res = await axios.post('/api/form/next', { formId, currentIndex, language, answers: allAnswers });
      const { question, status, form_id } = res.data;
      if(status === 'in_progress') {
        setCurrentAnswer('');
        setCurrentQuestion(question);
      } else if (status === 'last') {
        setCurrentAnswer('');
        setCurrentQuestion(question);
        setIsLast(true);
      } else if (status === 'complete') {
        setModalOpen(true);
        setFormId(form_id);
      }
      setCurrentIndex(currentIndex+1);
    } catch(err) {
      console.log(err);
      if(err?.response?.data?.name === 'NotFoundError')
        toast.error('Form data not found')
      navigate('/free-form');
    }
  }

  const onConfirmDialogClose = () => {
    setReviewModalOpen(true);
  }

  const onSubmit = (question, answer) => {
    setAnswers({
      ...answers,
      [question]: answer
    });
    getNext({
      ...answers,
      [question]: answer
    });
  }

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get('/api/auth/profile/');
        if(!formAvailable(response.data.user)) {
          toast.error('Upgrade your plan to try form.');
          navigate('/pricing');
        }

        const res = await axios.get('/api/form/free');
        const forms = (res.data || []).filter(form => form.formId === formId);
        if (forms.length) {
          setCurrentForm(forms[0]);
          getNext();
        }
      } catch(err) {
        console.log("ERROR", err);
        navigate('/free-forms')
      }
    };

    load();
  }, [])

  return (
    <div className='grid grid-cols-2 p-10'>
      <div className='col-span-1 p-5'>
        <FormStepper question={currentQuestion} onSubmit={onSubmit} value={currentAnswer} setValue={setCurrentAnswer} isLast={isLast} />
      </div>
      <div className='col-span-1 p-5'>
        <Mira formId={formId} />
      </div>
      <ConfirmDownloadModal open={modalOpen} onClose={onConfirmDialogClose} formId={formId} />
      <ReviewModal isOpen={reviewModalOpen} formId={formid} />
    </div>
  )

}