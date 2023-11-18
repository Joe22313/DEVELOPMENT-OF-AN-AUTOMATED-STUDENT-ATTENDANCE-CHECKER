const Loader = (props: any) => {
  return (
    <div className="wrapper" {...props}>
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="w-fit">{props.children}</p>
    </div>
  );
};

export default Loader;
