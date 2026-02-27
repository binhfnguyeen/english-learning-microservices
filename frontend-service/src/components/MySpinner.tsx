import { Spinner } from "react-bootstrap";

const MySpinner = ()=> {
    return (
        <div className="mt-2 d-flex justify-content-center">
            <Spinner animation="grow" variant="primary" />
        </div>
    );
}

export default MySpinner;