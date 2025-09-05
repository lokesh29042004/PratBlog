const Footer = () => {
  return (
    <footer className="border-t  bg-gray-200">
      <div className="container mx-auto py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-center gap-4">
        <p>&copy; {new Date().getFullYear()} PratBlog. All rights reserved.</p>
        
      </div>
    </footer>
  );
};

export default Footer;
