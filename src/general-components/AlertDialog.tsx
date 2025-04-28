import './styles/AlertDialog.scss';

interface AlertDialogProps {
    title: string;
    description: string;
    response: (value: boolean) => void;
}

function AlertDialogs({ title, description, response }: AlertDialogProps) {
    return (
    <section className='alert_dialog_background'>
        <div className='alert_dialog_content'>
            <h2>{title}</h2>
            <p>{description}</p>
            <div>
                <button onClick={() => response(true)}>Aceptar</button>
                <button onClick={() => response(false)}>Cancelar</button>
            </div>
        </div>
    </section>
    );
}

export default AlertDialogs;
