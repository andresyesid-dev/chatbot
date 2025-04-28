import './styles/Menu.scss'
import { useNavigate } from 'react-router-dom';

function Menu() {
    const navigate = useNavigate();
    const handleHome = () => {
        navigate('/');
    };
    return (
        <section className='menu-content'>
            <div className='delimiter'>
                <h1 onClick={handleHome}>ChatBot</h1>
            </div>
        </section>
    )
}

export default Menu