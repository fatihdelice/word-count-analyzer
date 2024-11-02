import { useState, ChangeEvent } from 'react';
import { Document, Packer, Paragraph } from 'docx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface WordCountResult {
    fileName: string;
    wordCounts: Record<string, number>;
    totalWords: number;
}



export default function WordCount() {
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<WordCountResult[]>([]);
    const [textInput, setTextInput] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'upload' | 'text'>('text');

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = Array.from(e.target.files || []);
        setFiles(uploadedFiles);
        setTextInput('');

        const fileResults: WordCountResult[] = await Promise.all(
            uploadedFiles.map(async (file) => {
                const text = await extractTextFromDocx(file);
                const wordCounts = countWords(text);
                return { fileName: file.name, wordCounts, totalWords: getTotalWords(wordCounts) };
            })
        );

        setResults(fileResults);
    };

    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setTextInput(e.target.value);
    };

    const handleAnalyzeText = () => {
        const wordCounts = countWords(textInput);
        const totalWords = getTotalWords(wordCounts);
        const result: WordCountResult = { fileName: 'Input Text', wordCounts, totalWords };

        setResults((prevResults) => [...prevResults, result]);
    };

    const handleTabChange = (tab: 'upload' | 'text') => {
        setActiveTab(tab);
        setTextInput('');
        setFiles([]);
        setResults([]);
    };

    const extractTextFromDocx = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const zip = new JSZip();

        const zipContent = await zip.loadAsync(arrayBuffer);
        const xmlFile = zipContent.file("word/document.xml");
        if (!xmlFile) {
            throw new Error("document.xml not found in DOCX file.");
        }

        const xmlContent = await xmlFile.async("text");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "application/xml");

        const text = Array.from(xmlDoc.getElementsByTagName("w:t"))
            .map(node => node.textContent)
            .join(" ");
        return text.normalize("NFC");
    };

    const countWords = (text: string): Record<string, number> => {
        const words = text
            .split(/\s+/)
            .filter(word => /\p{L}/u.test(word));
    
        return words.reduce((acc: Record<string, number>, word: string) => {
            const normalizedWord = normalizeWord(word);
            acc[normalizedWord] = (acc[normalizedWord] || 0) + 1;
            return acc;
        }, {});
    };
    
    const normalizeWord = (word: string): string => {
        return word
            .normalize("NFC")
            .toLocaleLowerCase('en-US');
    };
    
     
      

    const getTotalWords = (wordCounts: Record<string, number>): number => {
        return Object.values(wordCounts).reduce((sum, count) => sum + count, 0);
    };

    const downloadResults = () => {
        const doc = new Document({
            sections: results.map((result) => ({
                children: [
                    new Paragraph({ text: `File: ${result.fileName}`, heading: 'Heading1' }),
                    new Paragraph({ text: `Total Words: ${result.totalWords}`, spacing: { after: 200 } }),
                    ...Object.entries(result.wordCounts).map(
                        ([word, count]) => new Paragraph(`${word}: ${count}`)
                    ),
                ],
            })),
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, 'Word_Count_Results.docx');
        });
    };
    return (
        <div className="w-full mx-auto max-w-[636px] bg-white p-8 rounded-lg shadow-md min-h-96">
            <div className="flex items-center w-fit mb-4 bg-[#F4F4F5] rounded-lg p-1 text-[#71717A] flex-nowrap gap-2 h-fit">
                <button
                    onClick={() => handleTabChange('text')}
                    className={`px-3 py-1 border-none rounded-md  
                    ${activeTab === 'text' ? 'bg-white text-black' : 'bg-none'}`}
                >
                    Text Analyze
                </button>
                <button
                    onClick={() => handleTabChange('upload')}
                    className={`px-3 py-1 border-none rounded-md 
                    ${activeTab === 'upload' ? 'bg-white text-black' : 'bg-none'}`}
                >
                    File Upload Analyze
                </button>
            </div>

            <div className={`flex ${activeTab === 'text' ? 'flex-row' : 'flex-col'}`}>
                {activeTab === 'text' && (
                    <textarea
                        value={textInput}
                        onChange={handleTextChange}
                        rows={7}
                        placeholder="Metin girin..."
                        className="mr-4 mb-4 w-full px-4 py-2 border rounded-md text-gray-700"
                    />
                )}
                {activeTab === 'upload' && (
                    <label htmlFor="uploadFile1"
                        className="bg-white text-gray-500 font-semibold text-base rounded h-60 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-11 mb-2 fill-gray-500" viewBox="0 0 32 32">
                            <path
                                d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                                data-original="#000000" />
                            <path
                                d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                                data-original="#000000" />
                        </svg>
                        Upload file
                        <input type="file" id='uploadFile1' multiple accept=".docx" onChange={handleFileChange} className="hidden" />
                        <p className="text-xs font-medium text-gray-400 mt-2">DOCX Allowed.</p>
                    </label>
                )}
            </div>

            <div className='flex gap-3'>
                {activeTab === 'text' && (
                    <button
                        onClick={handleAnalyzeText}
                        className="mt-4 bg-[#f2930d] text-white px-6 py-2 rounded-md hover:bg-[#d58008]"
                    >
                        Analyze Text
                    </button>
                )}
                {results.length > 0 && (
                    <button
                        onClick={downloadResults}
                        className="mt-4 px-5 py-2.5 flex items-center justify-center rounded text-white text-sm tracking-wider font-medium border-none outline-none bg-blue-600 hover:bg-blue-700 active:bg-blue-600"
                    >
                        Download Results
                        <svg xmlns="http://www.w3.org/2000/svg" width="16px" fill="currentColor" className="ml-2 inline" viewBox="0 0 24 24">
                            <path
                                d="M12 16a.749.749 0 0 1-.542-.232l-5.25-5.5A.75.75 0 0 1 6.75 9H9.5V3.25c0-.689.561-1.25 1.25-1.25h2.5c.689 0 1.25.561 1.25 1.25V9h2.75a.75.75 0 0 1 .542 1.268l-5.25 5.5A.749.749 0 0 1 12 16zm10.25 6H1.75C.785 22 0 21.215 0 20.25v-.5C0 18.785.785 18 1.75 18h20.5c.965 0 1.75.785 1.75 1.75v.5c0 .965-.785 1.75-1.75 1.75z"
                                data-original="#000000" />
                        </svg>
                    </button>
                )}
            </div>


            {results.length > 0 && (
                <div className="mt-6">
                    {results.map((result, index) => (
                        <div key={index} className="mb-8 text-gray-700">
                            <h2 className="font-semibold text-lg mb-2">{result.fileName}</h2>
                            <p className="mb-4">Total Words: {result.totalWords}</p>

                            <div className="overflow-auto">
                                <table className="min-w-full bg-white border border-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 bg-gray-200 text-left font-semibold">Word</th>
                                            <th className="px-4 py-2 bg-gray-200 text-left font-semibold">Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(result.wordCounts).map(([word, count]) => (
                                            <tr key={word} className="border-b border-gray-300">
                                                <td className="px-4 py-2">{word}</td>
                                                <td className="px-4 py-2 font-bold">{count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}
