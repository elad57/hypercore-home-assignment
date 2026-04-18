import { ApolloServerPlugin } from '@apollo/server';

export const loggingPlugin: ApolloServerPlugin = {
  async requestDidStart({ request }) {
    const operation = request.operationName ?? 'anonymous';
    const started = Date.now();
    console.log(`[GraphQL] --> ${operation}`);

    return {
      async willSendResponse({ response }) {
        const ms = Date.now() - started;
        const hasErrors = !!(
          response.body.kind === 'single' && response.body.singleResult.errors?.length
        );
        if (hasErrors) {
          const errors = response.body.kind === 'single'
            ? response.body.singleResult.errors
            : [];
          console.error(`[GraphQL] <-- ${operation} (${ms}ms) ERROR:`, errors?.map(e => e.message));
        } else {
          console.log(`[GraphQL] <-- ${operation} (${ms}ms)`);
        }
      },

      async didEncounterErrors({ errors }) {
        for (const err of errors) {
          console.error(`[GraphQL] !! ${operation} threw:`, err.message);
        }
      },
    };
  },
};
