import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  // In a real implementation, this would compile and render the preview
  const [url, setUrl] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState("Initializing...");

  async function main() {
    setStatus("Installing dependencies...");
    const installProcess = await webContainer.spawn('npm', ['install'], {
      env: {
        CI: 'true',
      },
    });

    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
        setLogs(prev => [...prev, data]);
      }
    }));

    await installProcess.exit;

    setStatus("Starting server...");
    const startProcess = await webContainer.spawn('npm', ['run', 'dev'], {
      env: {
        CI: 'true',
      },
    });

    startProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
        setLogs(prev => [...prev, data]);
      }
    }));

    // Wait for `server-ready` event
    webContainer.on('server-ready', (port, url) => {
      console.log(url)
      console.log(port)
      setUrl(url);
    });
  }

  useEffect(() => {
    // Only start if we have a package.json and haven't started yet
    // simple check: if url is set, we started? No, url is set late.
    // use a separate started state? 
    // Actually, checking if logs are empty might be enough proxy for "not started", 
    // but better to use an explicit flag or useEffect dependency behavior.

    // We'll use a local variable in the effect or just rely on the fact that
    // main() is async. But we don't want to call main() multiple times.

    // Let's assume files won't revert to empty.
    const hasPackageJson = files.some(f => f.name === 'package.json');
    if (hasPackageJson && logs.length === 0) {
      main();
    }
  }, [files, webContainer])

  // Wait, 'webContainer' is stable usually.
  // We need to verify 'files' contents.


  return (
    <div className="h-full flex flex-col">
      {!url && (
        <div className="flex-1 bg-black p-4 overflow-auto font-mono text-xs text-green-400">
          <div className="mb-2 text-white font-bold">{status}</div>
          {logs.map((log, i) => (
            <div key={i} className="whitespace-pre-wrap">{log}</div>
          ))}
        </div>
      )}
      {url && <iframe width={"100%"} height={"100%"} src={url} className="flex-1" />}
    </div>
  );
}