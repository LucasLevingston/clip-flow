import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("should render the product name as the main heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "Clip Flow" }),
    ).toBeInTheDocument();
  });

  it("should render the value proposition copy", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/crie um canal, escolha um nicho/i),
    ).toBeInTheDocument();
  });
});
