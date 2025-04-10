import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';

export default function App() {
  const [numeroCorreto, setNumeroCorreto] = useState(gerarNumeroAleatorio());
  const [chute, setChute] = useState('');
  const [tentativas, setTentativas] = useState(5);
  const [mensagem, setMensagem] = useState('');
  const [dicas, setDicas] = useState([]);

  function gerarNumeroAleatorio() {
    return Math.floor(Math.random() * 101); // número de 0 a 100
  }

  function verificarChute() {
    const chuteNumero = parseInt(chute);

    if (isNaN(chuteNumero) || chuteNumero < 0 || chuteNumero > 100) {
      Alert.alert('Entrada inválida', 'Digite um número entre 0 e 100.');
      return;
    }

    if (chuteNumero === numeroCorreto) {
      setMensagem('Você escapou. Dessa vez');
    } else {
      const dica =
        chuteNumero < numeroCorreto
          ? `↑ O número oculto é maior que ${chuteNumero}`
          : `↓ O número oculto é menor que ${chuteNumero}`;

      const novasTentativas = tentativas - 1;
      setTentativas(novasTentativas);
      setDicas((prevDicas) => [...prevDicas, dica]);

      if (novasTentativas === 0) {
        setMensagem(`❌ Você perdeu! O número era ${numeroCorreto}.`);
      }
    }

    setChute('');
  }

  function reiniciarJogo() {
    setNumeroCorreto(gerarNumeroAleatorio());
    setChute('');
    setTentativas(5);
    setMensagem('');
    setDicas([]); // limpa o histórico de dicas
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Guess Or Die</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite um número entre 0 e 100"
        keyboardType="numeric"
        value={chute}
        onChangeText={setChute}
        onSubmitEditing={verificarChute} // 👈 Aqui é o segredo!
        returnKeyType="done"
      />

      <Text style={styles.tentativasTexto}>
        Tentativas restantes: {tentativas}
      </Text>

      <TouchableOpacity
        style={styles.botao}
        onPress={verificarChute}
        disabled={tentativas === 0 || mensagem.includes('acertou')}
      >
        <Text style={styles.botaoTexto}>Arriscar</Text>
      </TouchableOpacity>


      {dicas.length > 0 && (
        <View style={styles.dicasContainer}>
          <Text style={styles.dicasTitulo}></Text>
          {dicas.map((dica, index) => (
            <Text key={index} style={styles.dicaTexto}>
              {dica}
            </Text>
          ))}
        </View>
      )}

      {mensagem !== '' && <Text style={styles.mensagem}>{mensagem}</Text>}

      {(tentativas === 0 || mensagem.includes('acertou')) && (
        <TouchableOpacity style={styles.botao} onPress={reiniciarJogo}>
          <Text style={styles.botaoTexto}>(⓿_⓿) Mais uma vez?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // fundo escuro
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ff4d4d', // vermelho
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

  dicasTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff4d4d',
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
});
