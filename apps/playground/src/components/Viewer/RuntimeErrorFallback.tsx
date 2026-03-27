import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InstrumentErrorFallbackProps } from '@opendatacapture/react-core';
import { InstrumentErrorFallback } from '@opendatacapture/react-core';

export const RuntimeErrorFallback = (props: Omit<InstrumentErrorFallbackProps, 'title'>) => {
  const { t } = useTranslation();
  return (
    <InstrumentErrorFallback
      description={t({
        en: 'This means that your instrument successfully compiled, but caused an unexpected exception to be thrown in the browser. For example, this could happen in the render function of a dynamic form field. Although the bundler attempts to validate the structure of instruments at compile time, it is not possible to evaluate the runtime behavior of arbitrary JavaScript code.',
        fr: "Cela signifie que votre instrument a été compilé avec succès, mais a provoqué la levée d'une exception inattendue dans le navigateur. Par exemple, cela pourrait se produire dans la fonction de rendu d'un champ de formulaire dynamique. Bien que le bundler tente de valider la structure des instruments lors de la compilation, il n'est pas possible d'évaluer le comportement à l'exécution de code JavaScript arbitraire."
      })}
      title={t({ en: 'Unhandled Runtime Error', fr: "Erreur d'exécution non gérée" })}
      {...props}
    />
  );
};
