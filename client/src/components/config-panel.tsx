import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@stianlarsen/border-beam";
import { FiCopy } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism"; // Choose your preferred theme
import { useModuleContext } from "@/context/module-context";

// Define the list of available configuration files with .tf extensions
const CONFIG_FILES = [
  "main",
  "variables",
  "outputs",
  // Add more file names as needed
];

export function ConfigPanel() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [terraformConfig, setTerraformConfig] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { modules } = useModuleContext();

  // Function to fetch configuration based on the selected file
  const fetchTerraformConfig = async (fileName: string | null, modules: any) => {
    if (!fileName) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/output/${fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
      }
      const data = await response.text();
      setTerraformConfig(data);
      console.log(`Fetched config for ${fileName}:`, data);
    } catch (err) {
      console.error(`Error fetching ${fileName}:`, err);
      setError(`Error fetching ${fileName}: ${(err as Error).message}`);
      setTerraformConfig("");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the initial configuration when the component mounts or selectedFile changes
  useEffect(() => {
    fetchTerraformConfig(selectedFile, modules);
  }, [selectedFile, modules]);

  // Handle copying the configuration to the clipboard
  const handleCopy = () => {
    if (terraformConfig) {
      navigator.clipboard.writeText(terraformConfig);
      alert("Configuration copied to clipboard!");
      console.log("Configuration copied to clipboard.");
    }
  };

  // Handle file selection
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
  };

  return (
    <Card className="fixed top-0 right-0 m-4 bg-card/10 backdrop-filter backdrop-blur-sm self-start p-4">
      <CardHeader className="flex flex-col items-start">
        {/* Card Title */}
        <CardTitle className="text-lg font-semibold mb-4">Generated Terraform Config</CardTitle>

        {/* File Selection Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {CONFIG_FILES.map((file) => (
            <Button
              key={file}
              variant={file === selectedFile ? "default" : "outline"}
              onClick={() => handleFileSelect(file)}
              aria-pressed={file === selectedFile}
              aria-label={`Select ${file} configuration`}
            >
              {file}
            </Button>
          ))}
          {/* Icon Button for Copying Config */}
          <Button
            onClick={handleCopy}
            disabled={!terraformConfig}
            className="flex items-center justify-center"
            aria-label="Copy configuration to clipboard"
          >
            <FiCopy size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p className="text-sm text-gray-500">Loading configuration...</p>
          </div>
        )}

        {/* Error Message */}
        {!selectedFile || modules.length === 0 ? (
          <p className="text-sm text-gray-500">Please drag and drop blocks from the left to get started</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : null}

        {/* Configuration Display */}
        {selectedFile && !isLoading && !error && terraformConfig ? (
          <div className="rounded-lg overflow-y-auto overflow-x-auto max-w-[400px] max-h-[40vh] w-full md:w-40wh bg-gray-900 p-0">
            <SyntaxHighlighter
              language="terraform"
              style={nightOwl}
              showLineNumbers
              wrapLines
              lineNumberStyle={{ color: "#6b7280", paddingRight: "1em" }} // Tailwind's gray-500
              codeTagProps={{ style: { fontSize: '0.75em' } }} // Smaller font size
            >
              {terraformConfig}
            </SyntaxHighlighter>
          </div>
        ) : (
          !isLoading && !error && <p className="text-sm text-gray-500">No configuration available.</p>
        )}
      </CardContent>
      <BorderBeam size={100} duration={5} colorFrom="#7b42bc" colorTo="#a067da" />
    </Card>
  );
}
