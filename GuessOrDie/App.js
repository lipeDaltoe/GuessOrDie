import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Vibration,
  ImageBackground,
  Animated,
} from 'react-native';

export default function App() {
  const [numeroCorreto, setNumeroCorreto] = useState(gerarNumeroAleatorio());
  const [chute, setChute] = useState('');
  const [tentativas, setTentativas] = useState(5);
  const [mensagem, setMensagem] = useState('');
  const [dicas, setDicas] = useState([]);
  const [erroFatal, setErroFatal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isRed, setIsRed] = useState(false);
  const [somErro, setSomErro] = useState(null);
  const [somVitoria, setSomVitoria] = useState(null); // Novo
  const fadeAnim = useState(new Animated.Value(0))[0];
  const { width } = Dimensions.get('window');
  const ALERT_WIDTH = width * 0.8;

  function gerarNumeroAleatorio() {
    return Math.floor(Math.random() * 3) + 1;
  }

  async function tocarSomTenso() {
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/suspense.mp3')
    );
    setSomErro(sound);
    await sound.playAsync();
  }

  async function tocarSomVitoria() {
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/victory.mp3') // Adicione seu som aqui
    );
    setSomVitoria(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    if (erroFatal) {
      Vibration.vibrate([0, 500, 500, 500, 500], true);
      tocarSomTenso();

      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            Vibration.cancel();
            setMensagem('☠️ ERRO FATAL: Você perdeu completamente!');
            return 0;
          }
          return prev - 1;
        });

        setIsRed((prev) => !prev);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [erroFatal]);

  function verificarChute() {
    const chuteNumero = parseInt(chute);
    if (isNaN(chuteNumero) || chuteNumero < 0 || chuteNumero > 100) {
      Alert.alert('Entrada inválida', 'Digite um número entre 0 e 100.');
      return;
    }

    if (chuteNumero === numeroCorreto) {
      setMensagem('🎉 Você escapou 🎉 Dessa vez...');
      tocarSomVitoria();
    } else {
      const dica =
        chuteNumero < numeroCorreto
          ? `↑ O número oculto é maior que ${chuteNumero}`
          : `↓ O número oculto é menor que ${chuteNumero}`;

      const novasTentativas = tentativas - 1;
      setTentativas(novasTentativas);
      setDicas((prevDicas) => [...prevDicas, dica]);

      if (novasTentativas === 0) {
        setErroFatal(true);
        setMensagem('');
      }
    }

    setChute('');
  }

  async function reiniciarJogo() {
    Vibration.cancel(); // <- mover aqui em cima, para interromper logo

    setErroFatal(false);
    setNumeroCorreto(gerarNumeroAleatorio());
    setChute('');
    setTentativas(5);
    setMensagem('');
    setDicas([]);
    setCountdown(5);
    setIsRed(false);

    if (somErro) {
      await somErro.stopAsync();
      await somErro.unloadAsync();
    }

    if (somVitoria) {
      await somVitoria.stopAsync();
      await somVitoria.unloadAsync();
    }
  }


  const alertaFatalStyle = {
    position: 'absolute',
    top: '25%',
    left: (width - ALERT_WIDTH) / 2,
    width: ALERT_WIDTH,
    height: '50%',
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  };

  return (
    <ImageBackground
      source={require('./assets/background.jpg')}
      style={[styles.container, isRed && styles.piscar]}
      resizeMode="cover"
    >
      {erroFatal && (
        <Animated.View style={[alertaFatalStyle, { opacity: fadeAnim }]}>
          <Text style={styles.alertaTexto}>☠️ ERRO FATAL DETECTADO</Text>
          <Text style={styles.alertaCountdown}>Falha crítica em: {countdown}...</Text>
        </Animated.View>
      )}

      {/* Pop-up de vitória */}
      {mensagem.includes('escapou') && (
        <View style={styles.popup}>
          <Text style={styles.popupTexto}>{mensagem}</Text>
        </View>
      )}

      <Text style={styles.titulo}>Guess Or Die</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite um número entre 0 e 100"
        keyboardType="numeric"
        value={chute}
        onChangeText={setChute}
        onSubmitEditing={verificarChute}
        returnKeyType="done"
        placeholderTextColor="#888"
      />

      <Text style={styles.tentativasTexto}>
        Tentativas restantes: {tentativas}
      </Text>

      <TouchableOpacity
        style={styles.botao}
        onPress={verificarChute}
        disabled={tentativas === 0 || mensagem.includes('escapou')}
      >
        <Text style={styles.botaoTexto}>Arriscar?</Text>
      </TouchableOpacity>

      {dicas.length > 0 && (
        <View style={styles.dicasContainer}>
          {dicas.map((dica, index) => {
            let dicaFormatada;

            if (dica.includes('maior')) {
              const partes = dica.split('maior');
              dicaFormatada = (
                <>
                  {partes[0]}
                  <Text style={styles.maior}>maior</Text>
                  {partes[1]}
                </>
              );
            } else if (dica.includes('menor')) {
              const partes = dica.split('menor');
              dicaFormatada = (
                <>
                  {partes[0]}
                  <Text style={styles.menor}>menor</Text>
                  {partes[1]}
                </>
              );
            } else {
              dicaFormatada = dica;
            }

            return (
              <Text key={index} style={styles.dicaTexto}>
                {dicaFormatada}
              </Text>
            );
          })}
        </View>
      )}

      {(tentativas === 0 || mensagem.includes('escapou')) && (
        <TouchableOpacity style={styles.botao} onPress={reiniciarJogo}>
          <Text style={styles.botaoTexto}>(⓿_⓿) Mais uma vez?</Text>
        </TouchableOpacity>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  piscar: {
    backgroundColor: '#ff0000',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ff4d4d',
  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#ff4d4d',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#1e1e1e',
    color: 'white',
  },
  mensagem: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#ff4d4d',
  },
  tentativasTexto: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  dicasContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  dicaTexto: {
    fontSize: 16,
    color: 'white',
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4d',
  },
  botao: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  maior: {
    color: '#00A8FF',
    fontWeight: 'bold',
  },
  menor: {
    color: '#FF78CB',
    fontWeight: 'bold',
  },
  alertaTexto: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertaCountdown: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  popup: {
    position: 'absolute',
    top: '40%',
    backgroundColor: 'green',
    padding: 50,
    borderRadius: 10,
    zIndex: 15,
    elevation: 15,
  },
  popupTexto: {
    color: '#00FFAA',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

});
