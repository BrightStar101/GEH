import { useContext, useState } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../contexts/AuthContext';

export default function ReviewModal({ isOpen, formId }) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const onClose = () => {
    if (user.role === 'admin')
      navigate('/admin/dashboard');
    else
      navigate('/dashboard');
  }

  const handleSubmit = async () => {
    try {
      if (content === '') {
        toast.error('Content field is missing.');
        return;
      }
      const res = await axios.post('/api/reviews/', { rating, content, formId });
      setRating(0);
      setContent('');
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Leave a Review</h2>

        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={28}
              className={`cursor-pointer ${i <= rating ? 'text-yellow-400 fill-yellow-300' : 'text-gray-300'}`}
              onClick={() => setRating(i)}
            />
          ))}
        </div>

        <textarea
          rows="4"
          className="w-full border rounded-lg p-2 text-sm focus:ring focus:border-blue-400"
          placeholder="Write your feedback (optional)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="px-4 py-1.5 text-sm rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}