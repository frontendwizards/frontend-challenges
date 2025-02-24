# OTP Input Challenge

## Problem Description

Create an OTP (One-Time Password) input component that allows users to enter a multi-digit code. This component is commonly used in authentication processes where users need to verify their identity by entering a code sent to their email or phone.

## Requirements

- The component should consist of a series of input fields, each representing a single digit of the OTP.
- when a digit is entered, automatically moving focus to the next field as digits are entered.
- when a backspace is pressed, the focus should be moved to the previous field.
- The component should validate input to ensure only numeric characters are accepted.
- When the user completes the OTP entry, a callback function should be triggered to handle the input.
- For testing the callback function, display correct or incorrect message based on the input.

## Bonus Features

- **Accessibility Enhancements**: Make sure the component is accessible.
- **Customizable Length**: Allow the component to be configured for different OTP lengths (e.g., 4, 6, or 8 digits).
- **Visual Feedback**: Provides feedback for incorrect OTP entries, such as changing the border color of the input fields.
- **Unit tests**: Write unit tests for the component.
