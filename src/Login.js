import React, {Component} from 'react';
import './login.css'

const authenticationEndpoint = process.env.NODE_ENV === "production" ?
  'https://v23ym3h4j1.execute-api.us-east-1.amazonaws.com/prod'  :
  'https://x1lh61dmmd.execute-api.us-east-1.amazonaws.com/dev';

function getQueryParams(qs) {
  qs = qs.split('+').join(' ');
  var params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;
  // eslint-disable-next-line
  while (tokens = re.exec(qs)) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }
  return params;
}

function saveTokens(authorization_token, refresh_token) {
  if(authorization_token) {
    localStorage.setItem('authorization_token', authorization_token);
  }
  if(refresh_token) {
    localStorage.setItem('refresh_token', refresh_token);
  }
}

function clearTokens() {
  localStorage.removeItem('authorization_token');
  localStorage.removeItem('refresh_token');
}

function getTokens() {
  return {
    authorization_token: localStorage.getItem('authorization_token'),
    refresh_token: localStorage.getItem('refresh_token')
  }
}

class Login extends Component {
  componentWillMount() {
    var clearPath = true, query = getQueryParams(document.location.search);
    if (query.error) {
      clearTokens();
      this.props.onError(query.error);
    } else if (query.authorization_token || query.refresh_token)  {
      saveTokens(query.authorization_token, query.refresh_token);
    } else {
      clearPath = false
    }
    if (clearPath) {
      window.history.replaceState({authorization_token: ''}, document.title, '/todomvc-fauna/');
    }
    this.authorized(true)
  }
  doRefresh() {
    // called from the model when the is an auth error
    console.log("doRefresh")
    const refreshToken = getTokens().refresh_token;
    if (refreshToken) {
      return fetch(authenticationEndpoint + '/authentication/refresh/' + refreshToken).then((r)=>{
        return r.json().then((data) => {
          if (data.errorMessage) {
            this.props.onError(data.errorMessage);
          } else {
            saveTokens(data.authorization_token, data.refresh_token);
            this.authorized();
          }
        })
      })
    }
  }
  authorized(reload) {
    var tokens = getTokens();
    if (tokens.authorization_token) {
      tokens.doRefresh = this.doRefresh.bind(this)
      this.props.onAuthChange(tokens, reload)
    } else {
      this.props.onAuthChange({})
    }
  }
	render () {
    const authURL = authenticationEndpoint + '/authentication/signin/facebook';
		return (
			<div className="Login">
        {this.props.auth.authorization_token ?
          <a href="?error=logout" className="fbLogin"><div className="fbLogo"></div>Logout</a> :
          <a href={authURL} className="fbLogin"><div className="fbLogo"></div>Login with Facebook</a> }
      </div>
		);
	}
}

export default Login;
