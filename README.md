# Legal Helper - AI-Powered Legal Document Analysis

Legal Helper is a web application that helps users analyze legal documents to identify potential risks, ambiguities, and controversial points using AI technologies.

## Features

- **Document Upload**: Securely upload PDF files for analysis
- **AI-Powered Analysis**: Identify risks in legal documents using advanced AI
- **Risk Highlighting**: Clearly see high, medium and low-risk elements in your documents
- **Recommendations**: Get actionable suggestions for improving your legal documents

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **AI**: OpenAI API integration for document analysis
- **File Processing**: PDF parsing and management
- **Styling**: Custom Tailwind CSS components

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- OpenAI API key for full functionality

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/legal-helper.git
   cd legal-helper
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

- `src/app/` - Next.js pages and app router
- `src/components/` - Reusable React components
- `src/app/api/` - API routes for document upload and analysis
- `public/` - Static assets
- `uploads/` - Temporary storage for uploaded documents

## Usage

1. Navigate to the homepage and click "Analyze Document"
2. Upload a legal document (PDF format)
3. Wait for the AI to analyze the document
4. Review the highlighted risks and recommendations
5. Download the analysis or upload another document

## Future Enhancements

- User authentication and document history
- Integration with additional AI models
- Support for more document formats (DOCX, TXT)
- Customizable analysis parameters
- Legal professional marketplace for document review

## License

This project is licensed under the MIT License - see the LICENSE file for details. 