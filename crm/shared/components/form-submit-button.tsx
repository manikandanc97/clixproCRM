import React from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { Button, ButtonProps } from '@/shared/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface FormSubmitButtonProps extends ButtonProps {
  isDirty: boolean;
  isPending?: boolean;
  loadingText?: string;
}

export const FormSubmitButton = React.forwardRef<HTMLButtonElement, FormSubmitButtonProps>(
  ({ isDirty, isPending, loadingText = "Saving...", children, className, ...props }, ref) => {
    const context = useFormContext();
    
    // Fallback if not used within a FormProvider (though it usually should be)
    if (!context) {
      const disabled = isPending || !isDirty;
      return (
        <Button
          ref={ref}
          type="submit"
          disabled={disabled}
          className={cn(
            "min-w-32 transition-all", 
            disabled ? "opacity-50 cursor-not-allowed" : "",
            className
          )}
          {...props}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {loadingText}
            </>
          ) : (
            children
          )}
        </Button>
      );
    }

    // Subscribe to form validity
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isValid } = useFormState({ control: context.control });

    const disabled = isPending || !isDirty || !isValid;

    return (
      <Button
        ref={ref}
        type="submit"
        disabled={disabled}
        className={cn(
          "min-w-32 transition-all", 
          disabled ? "opacity-50 cursor-not-allowed" : "",
          className
        )}
        {...props}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

FormSubmitButton.displayName = "FormSubmitButton";
