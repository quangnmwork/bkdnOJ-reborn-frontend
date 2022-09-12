const FileUploader = ({onFileSelectSuccess}) => {
  const handleFileInput = e => {
    const file = e.target.files[0];
    // // Validation
    // if (file.size > 5*1024)
    //   onFileSelectError({ error: "File size cannot exceed more than 5MB" });
    // else
    // console.log(file.name)
    onFileSelectSuccess(file);
  };

  return (
    <div className="file-uploader">
      <input type="file" onChange={handleFileInput} />
      {/* <button onClick={e => fileInput.current && fileInput.current.click()} className="btn btn-primary"/> */}
    </div>
  );
};

export default FileUploader;
