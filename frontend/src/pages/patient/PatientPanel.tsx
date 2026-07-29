import { useEffect, useState } from "react";
import { ClipboardPlus, Pill, QrCode, Store, Stethoscope } from "lucide-react";
import { QrModal } from "../../components/qr/QrModal";
import { StatCard } from "../../components/ui/StatCard";
import { demoPharmacies, demoPrescriptions } from "../../data/mockData";
import { ApiClient, ApiError } from "../../services/api";
import { Prescription, QrPreview, Screen, ToastFn } from "../../types";
import { AvailabilityPanel } from "../shared/AvailabilityPanel";
import { DoctorListPanel } from "./DoctorListPanel";

type PatientPanelProps = {
  api: ApiClient;
  screen: Screen;
  setScreen: (screen: Screen) => void;
  notify: ToastFn;
};

export function PatientPanel({ api, screen, setScreen, notify }: PatientPanelProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [qrPreview, setQrPreview] = useState<QrPreview | null>(null);

  useEffect(() => {
    api.get<{ prescriptions: Prescription[] }>("/patient/prescriptions").then((data) => setPrescriptions(data.prescriptions)).catch(() => setPrescriptions(demoPrescriptions));
    api.get<{ doctors: any[] }>("/patient/doctors").then((data) => setDoctors(data.doctors)).catch(() => setDoctors([]));
  }, [api]);

  const downloadPdf = async (prescription: Prescription) => {
    try {
      const blob = await api.download(`/patient/prescriptions/${prescription.id}/pdf`);
      saveBlob(blob, `prescription-${prescription.id}.pdf`);
      notify("Prescription PDF downloaded.");
    } catch (error) {
      notify(error instanceof ApiError ? error.message : "Prescription PDF could not be downloaded");
    }
  };

  if (screen === "doctors") return <DoctorListPanel api={api} notify={notify} />;
  if (screen === "pharmacies") return <AvailabilityPanel api={api} />;

  return (
    <div className="content-stack">
      <div className="stats-grid">
        <StatCard icon={ClipboardPlus} label="Active prescriptions" value={prescriptions.filter((item) => item.status === "active").length || 1} onClick={() => document.getElementById("patient-prescriptions")?.scrollIntoView({ behavior: "smooth" })} />
        <StatCard icon={QrCode} label="QR codes" value={prescriptions.length || 1} onClick={() => document.getElementById("patient-prescriptions")?.scrollIntoView({ behavior: "smooth" })} />
        <StatCard icon={Stethoscope} label="Available doctors" value={doctors.length} onClick={() => setScreen("doctors")} />
        <StatCard icon={Store} label="Nearby pharmacies" value={demoPharmacies.length} onClick={() => setScreen("pharmacies")} />
      </div>

      <section className="section-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Current treatment</p>
            <h2>Medicines by disease and doctor</h2>
          </div>
        </div>
        <div className="treatment-grid">
          {(prescriptions.length ? prescriptions : demoPrescriptions)
            .filter((prescription) => prescription.status === "active")
            .map((prescription) => (
              <article className="treatment-card" key={prescription.id}>
                <div>
                  <span className="status active">{prescription.disease || "General treatment"}</span>
                  <h3>{prescription.doctor?.user?.fullName || "Doctor"}</h3>
                  <p>{prescription.doctor?.specialization || prescription.doctor?.hospitalName || "Treatment plan"}</p>
                  <button className="ghost-button compact" onClick={() => setScreen("doctors")}>
                    Book appointment
                  </button>
                </div>
                <div className="medicine-list">
                  {prescription.items.map((item, index) => (
                    <div key={`${prescription.id}-${item.medicineName}-${index}`}>
                      <Pill size={16} />
                      <span>{item.medicineName}</span>
                      <small>
                        {item.dosage} · {item.durationDays} days
                      </small>
                    </div>
                  ))}
                </div>
              </article>
            ))}
        </div>
      </section>

      <section className="section-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Doctors</p>
            <h2>Available doctors</h2>
          </div>
        </div>
        <div className="doctor-grid">
          {doctors.map((doctor) => (
            <article className="doctor-card" key={doctor.id}>
              {doctor.user?.profilePhoto ? (
                <img src={doctor.user.profilePhoto} alt={doctor.user.fullName} />
              ) : (
                <div className="doctor-avatar">{doctor.user?.fullName?.slice(0, 1) || "D"}</div>
              )}
              <div>
                <h3>{doctor.user?.fullName}</h3>
                <p>{doctor.specialization}</p>
                <span>{doctor.hospitalName}</span>
              </div>
            </article>
          ))}
          {!doctors.length && <p className="empty-state">No approved doctors are available yet.</p>}
        </div>
      </section>
      
      {qrPreview && <QrModal qr={qrPreview} onClose={() => setQrPreview(null)} />}
    </div>
  );
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
