import { useNavigate } from 'react-router-dom';
import LetterGlitch from '../components/LetterGlitch';
import TextType from '../components/TextType';

const HomePage = () => {
  const navigate = useNavigate();

  const handlePageClick = () => {
    navigate('/snippets');
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center cursor-pointer"
      onClick={handlePageClick}
    >
      {/* Letter Glitch Background */}
      <div className="absolute inset-0">
        <LetterGlitch
          glitchColors={['#256141', '#d39b1d', '#b3bf99']}
          glitchSpeed={5}
          centerVignette={true}
          outerVignette={true}
          smooth={true}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center pointer-events-none">
        <h1 className="text-7xl font-semibold text-white mb-8 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
          <TextType 
            text={["Code Snippets", "Your Library", "Save & Organize"]}
            typingSpeed={20}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-7xl font-semibold text-white tracking-tight"
          />
        </h1>
        <div className="text-gray-200 hover:text-white transition-colors text-base font-medium tracking-wide">
          View Library →
        </div>
      </div>
    </div>
  );
};

export default HomePage;
