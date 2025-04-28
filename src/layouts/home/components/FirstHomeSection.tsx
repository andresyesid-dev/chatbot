import './styles/FirstHomeSection.scss';

import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faAddressBook } from '@fortawesome/free-solid-svg-icons';

function FirstHomeSection() {
  const navigate = useNavigate();

  // Define el tipo para el parámetro `link`
  const handleClick = (link: string) => {
    window.open(link, '_blank');
  };

  const handleChat = () => {
    navigate('/chat');
  };

  return (
    <section className="first-section-content">
      <img src="/chatbot_icon.png" alt="ChatBot Icon" />
      <h1>Welcome to the new ChatBot!</h1>
      <div className="directions">
        <section onClick={() => handleClick('https://github.com/andresyesid-dev/chatbot')}>
          <span>
            <FontAwesomeIcon icon={faGithub} />
          </span>
          <h3>Repository</h3>
        </section>
        <section onClick={() => handleClick('https://www.linkedin.com/in/andres-yesid-motta-sarmiento-a83806276/')}>
          <span>
            <FontAwesomeIcon icon={faLinkedin} />
          </span>
          <h3>LinkedIn</h3>
        </section>
        <section onClick={() => handleClick('https://andredev.me/')}>
          <span>
            <FontAwesomeIcon icon={faAddressBook} />
          </span>
          <h3>Portfolio</h3>
        </section>
      </div>
      <button onClick={handleChat}>Start Chat</button>
    </section>
  );
}

export default FirstHomeSection;
