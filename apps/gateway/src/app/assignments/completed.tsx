const Completed = () => {
  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-1 p-3 text-center">
      <h1 className="text-muted text-sm font-semibold uppercase tracking-wide">Oops</h1>
      <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">Already Completed</h3>
      <p className="text-muted mt-2 max-w-prose text-sm sm:text-base">{'This assignment has already been completed'}</p>
    </div>
  );
};

export default Completed;
