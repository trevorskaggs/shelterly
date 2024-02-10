import React from 'react';
import { Link } from 'raviger';

const LoadingLink = ({
  as = Link,
  isLoading = true,
  loadingClassName = 'text-dark',
  children,
  href = '',
  ...rest
}) => {
  const LinkComponent = as;
  if (isLoading) {
    const NoLink = () =>
      React.Children.map(children, child =>
        React.cloneElement(child, {
          className: `${child.props.className} ${loadingClassName}`
        })
      );
    return <NoLink />;
  }
  return (
    <LinkComponent href={href} {...rest}>
      {children}
    </LinkComponent>
  )
};

export default LoadingLink;
