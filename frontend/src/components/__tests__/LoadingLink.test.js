import React from "react";
import {
  render,
} from "@testing-library/react";
import LoadingLink from "../LoadingLink";

describe('Components > LoadingLink', () => {
  it('renders only children of LoadingLink in default state', () => {
    const { getByTestId, queryByTestId } = render(
      <LoadingLink data-testid="loading-link-test">
        <span data-testid="loading-link-children">Hello</span>
      </LoadingLink>
    )
    expect(queryByTestId('loading-link-test')).not.toBeInTheDocument();
    expect(getByTestId('loading-link-children')).toBeInTheDocument();
  });

  it('should render LoadingLink with children in non-loading state', () => {
    const { getByTestId } = render(
      <LoadingLink data-testid="loading-link-test" isLoading={false}>
        <span data-testid="loading-link-children">Hello</span>
      </LoadingLink>
    )
    expect(getByTestId('loading-link-test')).toBeInTheDocument();
    expect(getByTestId('loading-link-children')).toBeInTheDocument();
  })
});
