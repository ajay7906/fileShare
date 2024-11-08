class WebRTCService {
    constructor(socket) {
      this.socket = socket;
      this.peerConnection = null;
      this.dataChannel = null;
      this.fileChunks = [];
      this.onProgressCallback = null;
    }
  
    async initializePeerConnection() {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
  
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('ice_candidate', {
            candidate: event.candidate,
            to: this.targetUserId
          });
        }
      };
  
      this.dataChannel = this.peerConnection.createDataChannel('fileTransfer');
      this.setupDataChannel(this.dataChannel);
    }
  
    setupDataChannel(channel) {
      channel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'file-start') {
          this.fileChunks = [];
        } else if (data.type === 'file-chunk') {
          this.fileChunks.push(data.chunk);
          if (this.onProgressCallback) {
            this.onProgressCallback((this.fileChunks.length / data.totalChunks) * 100);
          }
        } else if (data.type === 'file-end') {
          this.downloadFile(data.fileName);
        }
      };
    }
  
    async sendFile(file) {
      const chunkSize = 16384; // 16KB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      
      this.dataChannel.send(JSON.stringify({
        type: 'file-start',
        fileName: file.name,
        totalChunks
      }));
  
      const reader = new FileReader();
      let offset = 0;
  
      reader.onload = (e) => {
        this.dataChannel.send(JSON.stringify({
          type: 'file-chunk',
          chunk: e.target.result,
          totalChunks
        }));
  
        offset += e.target.result.length;
        if (this.onProgressCallback) {
          this.onProgressCallback((offset / file.size) * 100);
        }
  
        if (offset < file.size) {
          readSlice(offset);
        } else {
          this.dataChannel.send(JSON.stringify({
            type: 'file-end',
            fileName: file.name
          }));
        }
      };
  
      const readSlice = (o) => {
        const slice = file.slice(o, o + chunkSize);
        reader.readAsArrayBuffer(slice);
      };
  
      readSlice(0);
    }
  
    downloadFile(fileName) {
      const blob = new Blob(this.fileChunks);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      this.fileChunks = [];
    }
  
    setOnProgress(callback) {
      this.onProgressCallback = callback;
    }
  }
  
  export default WebRTCService;