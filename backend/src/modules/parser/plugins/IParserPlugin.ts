export interface IParserPlugin {
  id: string;
  name: string;
  
  /**
   * The exact terminal command we show the user to extract their schema.
   */
  getImportCommand(): string; 
  
  /**
   * Instructions on how to fix common errors if parsing fails.
   */
  getTroubleshootingGuide(): string; 
  
  /**
   * The actual parsing logic. Throws an error if invalid, returns DSL string if successful.
   * @param content The raw schema text pasted by the user.
   * @returns The generated SchemaFlow DSL string.
   */
  parse(content: string): Promise<string>; 
}
