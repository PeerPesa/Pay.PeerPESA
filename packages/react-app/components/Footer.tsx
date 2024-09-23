type Props = {
  className?: string;
};

const navigation = [
  {
    name: "Twitter",
    href: "https://twitter.com/CeloDevs",
    icon: (props: Props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
    <path d="M2.50012 12C2.50012 7.52166 2.50012 5.28249 3.89136 3.89124C5.28261 2.5 7.52178 2.5 12.0001 2.5C16.4785 2.5 18.7176 2.5 20.1089 3.89124C21.5001 5.28249 21.5001 7.52166 21.5001 12C21.5001 16.4783 21.5001 18.7175 20.1089 20.1088C18.7176 21.5 16.4785 21.5 12.0001 21.5C7.52178 21.5 5.28261 21.5 3.89136 20.1088C2.50012 18.7175 2.50012 16.4783 2.50012 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M7.00012 17L11.1937 12.8065M17.0001 7L12.8066 11.1935M12.8066 11.1935L9.7779 7H7.00012L11.1937 12.8065M12.8066 11.1935L17.0001 17H14.2223L11.1937 12.8065" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
    ),
  },
  {
    name: "GitHub",
    href: "https:",
    icon: (props: Props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
    <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" stroke-width="1.5" />
    <path d="M11.5 12.5L15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com",
    icon: (props: Props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
      <path d="M7 10V17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M11 13V17M11 13C11 11.3431 12.3431 10 14 10C15.6569 10 17 11.3431 17 13V17M11 13V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M7.00801 7L6.99902 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
  </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com",
    icon: (props: Props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.18182 10.3333C5.20406 10.3333 5 10.5252 5 11.4444V13.1111C5 14.0304 5.20406 14.2222 6.18182 14.2222H8.54545V20.8889C8.54545 21.8081 8.74951 22 9.72727 22H12.0909C13.0687 22 13.2727 21.8081 13.2727 20.8889V14.2222H15.9267C16.6683 14.2222 16.8594 14.0867 17.0631 13.4164L17.5696 11.7497C17.9185 10.6014 17.7035 10.3333 16.4332 10.3333H13.2727V7.55556C13.2727 6.94191 13.8018 6.44444 14.4545 6.44444H17.8182C18.7959 6.44444 19 6.25259 19 5.33333V3.11111C19 2.19185 18.7959 2 17.8182 2H14.4545C11.191 2 8.54545 4.48731 8.54545 7.55556V10.3333H6.18182Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
</svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com",
    icon: (props: Props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
    <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12Z" stroke="currentColor" stroke-width="1.5" />
    <path d="M17.5078 6.5L17.4988 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-200 border-t border-gray-300 text-light-gray">
      <div className="max-w-sm px-4 py-6 mx-auto sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between h-16 space-y-4">
          <div className="flex space-x-6">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="transition-colors duration-300 text-light-gray hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="w-6 h-6" aria-hidden="true" />
              </a>
            ))}
          </div>
          <div>
            <p className="text-sm text-center text-light-gray">
              &copy; {new Date().getFullYear()} PeerPesa. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
