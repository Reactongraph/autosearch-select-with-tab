import React from "react";

const ImageContainer = ({
  notifier,
  id,
  alt,
  width,
  height,
  className,
  src,
  onClick,
  align,
  server
}) => (
  <React.Fragment>
    <img
      id={id ? id : ""}
      alt={alt}
      width={width}
      height={height}
      onClick={onClick}
      className={className}
      align={align ? align : ""}
      src={server ? `${src}` : `${process.env.PUBLIC_URL}/assets/img/${src}`}
    />
  </React.Fragment>
);

export default ImageContainer;
