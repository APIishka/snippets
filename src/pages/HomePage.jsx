import { Link } from 'react-router-dom';
import Silk from '../components/Silk';
import TextType from '../components/TextType';

const HomePage = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Animated Silk Background */}
      <div className="absolute inset-0">
        <Silk
          speed={5}
          scale={1}
          color="#25d5f8"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-7xl font-semibold text-white mb-8 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
          <TextType 
            text={["Code Snippets", "Your Library", "Save & Organize"]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-7xl font-semibold text-white tracking-tight"
          />
        </h1>
        <Link
          to="/snippets"
          className="text-gray-200 hover:text-white transition-colors text-base font-medium tracking-wide cursor-pointer"
        >
          View Library →
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
