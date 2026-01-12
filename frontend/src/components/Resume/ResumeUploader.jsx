import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Sparkles } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import { uploadResume, getResumeStatus } from '../../services/api';

const ResumeUploader = () => {
  const {
    resume,
    setResume,
    setResumeUploading,
    resumeUploading,
    setResumeError,
    resumeError
  } = useChatStore();

  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (file.type !== 'application/pdf') {
      setResumeError('Please upload a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResumeError('File size must be less than 10MB');
      return;
    }

    try {
      setResumeUploading(true);
      setResumeError(null);
      setUploadProgress(0);

      const response = await uploadResume(file, (progress) => {
        setUploadProgress(progress);
      });

      if (!response.success) {
        throw new Error('Upload failed');
      }

      const resumeData = response.resume;

      const pollStatus = async () => {
        try {
          const statusResponse = await getResumeStatus(resumeData.id);
          const status = statusResponse.resume.processing_status;

          if (status === 'completed') {
            setResume({
              id: resumeData.id,
              filename: resumeData.original_name,
              status: 'completed'
            });
            setResumeUploading(false);
          } else if (status === 'failed') {
            setResumeError('Resume processing failed');
            setResumeUploading(false);
          } else {
            setTimeout(pollStatus, 4000);
          }
        } catch (err) {
          setResumeError('Failed to check resume status');
          setResumeUploading(false);
        }
      };

      pollStatus();
    } catch (error) {
      setResumeError(error.message || 'Upload failed');
      setResumeUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  if (resume && !resumeUploading) {
    return (
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-500/20 p-3 rounded-xl">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white truncate">
              {resume.filename}
            </h3>
            <p className="text-sm text-dark-400">
              Resume processed and ready
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-dark-800">
          <button
            onClick={() => setResume(null)}
            className="btn-ghost w-full text-sm"
          >
            Upload Different Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div
        className={`border-2 border-dashed rounded-xl p-8 transition-all
          ${dragActive
            ? 'border-primary-500 bg-primary-500/5'
            : 'border-dark-700 hover:bg-dark-800/30'
          }
        `}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          disabled={resumeUploading}
        />

        <div className="flex flex-col items-center gap-4">
          {resumeUploading ? (
            <>
              <Loader className="w-8 h-8 text-primary-500 animate-spin" />
              <p className="text-sm text-white">Processing resume...</p>

              <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-primary-500" />
              <h3 className="text-lg font-semibold text-white">
                Upload Your Resume
              </h3>
              <p className="text-sm text-dark-400 text-center">
                PDF only. Max size 10MB.
              </p>
              <button onClick={onButtonClick} className="btn-primary">
                <FileText className="w-4 h-4" />
                Choose File
              </button>
            </>
          )}
        </div>

        {resumeError && (
          <div className="mt-4 flex gap-2 text-red-400 bg-red-500/10 px-4 py-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{resumeError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;
