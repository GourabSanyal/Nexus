import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRecoilState } from 'recoil';
import { importWalletState } from '@repo/store/src/atoms/importWalletState';
import { importWalletSchema, type ImportWalletSchema } from '@repo/zod/src/walletSchemas/importWalletSchema';

export const useImportWalletForm = () => {
  const [importState, setImportState] = useRecoilState(importWalletState);
  const [isFormValid, setIsFormValid] = useState(false);
  
  const methods = useForm<ImportWalletSchema>({
    resolver: zodResolver(importWalletSchema),
    defaultValues: {
      isImporting: false,
      currentPhase: 'input',
      inputData: {
        seedPhraseWords: Array.from({ length: 12 }, () => ''),
        seedPhrase: '',
        privateKey: '',
        password: '',
      },
      validationErrors: [],
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

   // sync from persisted state to form on load or change
  useEffect(() => {
    if (importState.currentPhase !== methods.getValues('currentPhase')) {
      methods.reset(importState);
    }
  }, [importState, methods]);

  // persistance update on change in form values
  useEffect(() => {
    const subscription = methods.watch((formData) => {
      setImportState(formData as ImportWalletSchema);
      
      // validity checking of words filled
      const words = formData.inputData?.seedPhraseWords || [];
      const isValid = words.length === 12 && 
        words.every(word => word && /^[a-z]+$/.test(word)) &&
        Object.keys(methods.formState.errors).length === 0;
      
      setIsFormValid(isValid);
    });
    return () => subscription.unsubscribe();
  }, [methods, setImportState]);

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const words = pastedText.trim().toLowerCase().split(/\s+/);
    
    if (words.length > 12) {
      methods.setError('inputData.seedPhraseWords', {
        type: 'manual',
        message: 'Invalid seed phrase length'
      });
      return;
    }

    // clear existing errors before setting new values
    methods.clearErrors();

    // Fill array with existing words or empty strings
    const newWords = Array(12).fill('');
    words.forEach((word, index) => {
      if (index < 12) {
        // accept letters only
        const cleanWord = word.replace(/[^a-zA-Z]/g, '');
        if (cleanWord) {
          newWords[index] = cleanWord;
        }
      }
    });

    methods.setValue('inputData.seedPhraseWords', newWords, {
      shouldValidate: true
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const currentValue = methods.getValues(`inputData.seedPhraseWords.${index}`);
    
    if (e.key === 'Backspace' && !currentValue && index > 0) {
      e.preventDefault();
      const prevInput = document.querySelector(`input[placeholder="Word ${index}"]`) as HTMLInputElement;
      prevInput?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevInput = document.querySelector(`input[placeholder="Word ${index}"]`) as HTMLInputElement;
      prevInput?.focus();
    } else if (e.key === 'ArrowRight' && index < 11) {
      e.preventDefault();
      const nextInput = document.querySelector(`input[placeholder="Word ${index + 2}"]`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      setImportState(prev => ({
        ...prev,
        isImporting: true,
        currentPhase: 'validation',
      }));

      console.log('Importing wallet with data:', data);
      // TODO: Implement actual wallet import logic

    } catch (error) {
      setImportState(prev => ({
        ...prev,
        validationErrors: [error instanceof Error ? error.message : 'Unknown error'],
        currentPhase: 'input',
        isImporting: false,
      }));
    }
  });

  return {
    methods,
    handlePaste,
    handleKeyDown,
    onSubmit,
    isFormValid
  };
};