import { useState } from "react";
import {
  Upload,
  FileScan,
  Shield,
  Hash,
  FileType,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

const API = "http://127.0.0.1:8001";

type ScanResult = {
  filename: string;
  size: number;
  size_kb: number;
  extension: string;
  mime_type: string;
  sha256: string;
  risk_score: number;
  severity: string;
  safe_to_execute: boolean;
  message: string;
};

export default function FileScanner() {

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  async function scanFile() {

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {

      const response = await fetch(
        `${API}/api/scanner/file`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "File scan failed"
        );
      }

      setResult(data.result);

    } catch (err: any) {
      setError(
        err.message || "Unable to connect to scanner"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(
    e: React.DragEvent<HTMLDivElement>
  ) {

    e.preventDefault();
    setDragging(false);

    const dropped = e.dataTransfer.files?.[0];

    if (dropped) {
      setFile(dropped);
      setResult(null);
      setError("");
    }
  }

  return (
    <div className="scanner-page">

      <div className="scanner-hero">

        <div className="scanner-hero-icon">
          <FileScan size={25}/>
        </div>

        <div>
          <h1>File Scanner</h1>

          <p>
            Analyze suspicious files using safe static
            analysis and cryptographic hashing.
          </p>
        </div>

        <div className="scanner-status">
          <span/>
          SECURE ANALYSIS
        </div>

      </div>


      <div
        className={`upload-zone ${
          dragging ? "dragging" : ""
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >

        <div className="upload-icon">
          <Upload size={26}/>
        </div>

        <h2>
          {file
            ? file.name
            : "Drop a file here"}
        </h2>

        <p>
          or select a file from your computer
        </p>

        <label className="select-file">

          <Upload size={15}/>

          Select File

          <input
            type="file"
            hidden
            onChange={(e) => {

              const selected =
                e.target.files?.[0];

              if (selected) {
                setFile(selected);
                setResult(null);
                setError("");
              }

            }}
          />

        </label>

        <small>
          Maximum file size: 25 MB
        </small>

      </div>


      {file && (

        <div className="selected-file">

          <div className="selected-icon">
            <FileType size={18}/>
          </div>

          <div>
            <strong>{file.name}</strong>
            <small>
              {(file.size / 1024).toFixed(2)} KB
            </small>
          </div>

          <button
            className="scan-button"
            onClick={scanFile}
            disabled={loading}
          >

            {loading ? (
              <>
                <RefreshCw
                  size={15}
                  className="spin"
                />
                Analyzing...
              </>
            ) : (
              <>
                <Shield size={15}/>
                Analyze File
              </>
            )}

          </button>

        </div>

      )}


      {error && (

        <div className="scanner-error">
          <AlertTriangle size={17}/>
          {error}
        </div>

      )}


      {result && (

        <div className="scan-result">

          <div className="result-header">

            <div>
              <h2>Analysis Complete</h2>
              <p>
                Static analysis completed without
                executing the uploaded file.
              </p>
            </div>

            <div
              className={`result-severity ${
                result.severity.toLowerCase()
              }`}
            >
              {result.severity}
            </div>

          </div>


          <div className="risk-banner">

            <div className="risk-circle">
              {result.risk_score}
            </div>

            <div>
              <span>THREAT RISK SCORE</span>
              <strong>
                {result.risk_score}/100
              </strong>
            </div>

          </div>


          <div className="file-details">

            <div className="file-detail">
              <FileType size={16}/>
              <span>FILE TYPE</span>
              <strong>
                {result.mime_type}
              </strong>
            </div>

            <div className="file-detail">
              <HardDrive size={16}/>
              <span>SIZE</span>
              <strong>
                {result.size_kb} KB
              </strong>
            </div>

            <div className="file-detail">
              <Hash size={16}/>
              <span>SHA-256</span>
              <strong className="hash">
                {result.sha256}
              </strong>
            </div>

            <div className="file-detail">
              <Shield size={16}/>
              <span>ANALYSIS</span>
              <strong>
                Static / Safe
              </strong>
            </div>

          </div>


          <div className="scanner-notice">

            <CheckCircle size={16}/>

            <span>
              {result.message}
              {" "}Uploaded files are never executed
              by ThreatLens.
            </span>

          </div>

        </div>

      )}

    </div>
  );
}
