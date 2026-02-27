"use client";
import {Container} from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Footer() {
    return (
        <footer className="bg-light text-center text-muted py-3 mt-auto shadow-sm">
            <Container>
                <small>ElearnWeb &copy; 2025. All rights reserved.</small>
            </Container>
        </footer>
    );
}