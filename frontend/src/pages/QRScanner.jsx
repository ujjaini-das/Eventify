import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./QRScanner.css";

function QRScanner() {
    const { eventId } = useParams();
    const [result, setResult] = useState("");
    const [status, setStatus] = useState("");
    const [checkingIn, setCheckingIn] = useState(false);
    const [attendee, setAttendee] = useState(null);

    const handleScan = async (detectedCodes) => {
        if (!detectedCodes || detectedCodes.length === 0) {
            return;
        }

        const ticketId = detectedCodes[0]?.rawValue;

        if (!ticketId || checkingIn) {
            return;
        }

        setResult(ticketId);
        setCheckingIn(true);
        setStatus("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/registrations/check-in",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ticketId,
                        eventId
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Check-in failed"
                );
            }

            setStatus("success");

            setAttendee(data.registration);

        } catch (error) {
            console.error("CHECK-IN ERROR:", error);
            setStatus(error.message);
        } finally {
            setCheckingIn(false);
        }
    };

    return (
        <main className="scanner-page">

            <Link to="/dashboard" className="scanner-back">
                ← Back to Dashboard
            </Link>

            <div className="scanner-header">
                <p className="section-label">
                    ATTENDANCE
                </p>

                <h1>Scan Ticket.</h1>

                <p>
                    Scan an attendee's QR code to verify
                    their ticket and mark them as checked in.
                </p>
            </div>

            <div className="scanner-card">

                <div className="scanner-camera">
                    <Scanner
                        onScan={handleScan}
                        onError={(error) =>
                            console.error(
                                "QR SCANNER ERROR:",
                                error
                            )
                        }
                    />
                </div>

                {checkingIn && (
                    <div className="scanner-message">
                        Verifying ticket...
                    </div>
                )}

                {status === "success" && attendee && (
                        <div className="scanner-success">

                            <div className="checkin-success-header">
                                <strong>✓ Check-in successful</strong>
                            </div>

                            <div className="attendee-details">

                                <div>
                                    <span>ATTENDEE</span>
                                    <strong>{attendee.user?.name}</strong>
                                </div>

                                <div>
                                    <span>EMAIL</span>
                                    <strong>{attendee.user?.email}</strong>
                                </div>

                                <div>
                                    <span>EVENT</span>
                                    <strong>{attendee.event?.title}</strong>
                                </div>

                                <div>
                                    <span>TICKET ID</span>
                                    <strong>{attendee.ticketId}</strong>
                                </div>

                                <div>
                                    <span>CHECKED IN AT</span>
                                    <strong>
                                        {new Date(attendee.checkedInAt).toLocaleString("en-IN")}
                                    </strong>
                                </div>

                            </div>

                        </div>
                    )}

                {status && status !== "success" && (
                    <div className="scanner-error">
                        {status}
                    </div>
                )}

            </div>

        </main>
    );
}

export default QRScanner;