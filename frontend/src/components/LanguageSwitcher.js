import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const [currentLanguage, setCurrentLanguage] = useState(
        i18n.resolvedLanguage || i18n.language || 'en'
    );

    useEffect(() => {
        const savedLanguage =
            localStorage.getItem('language') ||
            i18n.resolvedLanguage ||
            i18n.language ||
            'en';

        if (
            savedLanguage !== 'en' &&
            savedLanguage !== 'ha'
        ) {
            i18n.changeLanguage('en');
            setCurrentLanguage('en');
            return;
        }

        if (i18n.language !== savedLanguage) {
            i18n.changeLanguage(savedLanguage);
        }

        setCurrentLanguage(savedLanguage);
    }, [i18n]);

    useEffect(() => {
        const handleLanguageChanged = (language) => {
            const normalizedLanguage =
                language.startsWith('ha')
                    ? 'ha'
                    : 'en';

            setCurrentLanguage(normalizedLanguage);
        };

        i18n.on(
            'languageChanged',
            handleLanguageChanged
        );

        return () => {
            i18n.off(
                'languageChanged',
                handleLanguageChanged
            );
        };
    }, [i18n]);

    const toggleLanguage = async () => {
        const newLanguage =
            currentLanguage === 'en'
                ? 'ha'
                : 'en';

        await i18n.changeLanguage(
            newLanguage
        );

        localStorage.setItem(
            'language',
            newLanguage
        );

        setCurrentLanguage(newLanguage);
    };

    return (
        <Button
            variant="contained"
            onClick={toggleLanguage}
            size="small"
        >
            {currentLanguage === 'en'
                ? 'Hausa'
                : 'English'}
        </Button>
    );
};

export default LanguageSwitcher;