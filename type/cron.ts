declare module "cron-parser" {
    export function parseExpression(cron: string, options?: any): {
      next: () => { toDate: () => Date };
    };
  }